-- =============================================================================
-- Snekart – full database schema (tables + Category/Product stored procedures)
--
-- This single file replaces the old 01_CreateTables.sql / 02_AddCategoriesAnd
-- ProductTags.sql / 03_CategoryAndProductProcedures.sql. It is the "fresh install"
-- script: run it once against an empty database.
--
--   * Table order matters: a table with a FOREIGN KEY is created AFTER the table
--     it points to (e.g. Sessions needs Customers first).
--   * Table creation is guarded with IF NOT EXISTS, so re-running the file will
--     not error, but it also will NOT alter a table that already exists with an
--     older shape. For an already-live DB, apply column changes by hand.
--   * Stored procedures use CREATE OR ALTER and are always safe to re-run.
--
-- NOTE: the app also calls stored procedures that were never checked into source
-- control – they must already exist in the target database. This file only
-- carries what the old three files carried. Missing here:
--   usp_Auth_*, usp_Session_*, usp_Customer_*   (auth / login)
--   usp_Order_*, usp_OrderItem_*                (checkout / orders)
--   usp_BlogPost_*                              (blog)
--   usp_Review_*                                (product reviews)
--   usp_Newsletter_*                            (newsletter)
--   usp_Product_Delete                          (the one Product proc file 03 omitted)
-- =============================================================================

USE Snekart;
GO

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Customers
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.Customers', 'U') IS NULL
BEGIN
    CREATE TABLE Customers (
        Id           INT IDENTITY(1,1) PRIMARY KEY,
        Name         NVARCHAR(255)     NOT NULL,
        Email        NVARCHAR(255)     NOT NULL,
        PasswordHash NVARCHAR(255)     NOT NULL,
        Level        NVARCHAR(50)      NOT NULL DEFAULT 'customer',
        CreatedAt    DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME()
    );

    -- No two customers can share an email
    CREATE UNIQUE INDEX IX_Customers_Email ON Customers(Email);
END
GO

-- -----------------------------------------------------------------------------
-- Sessions  (the login-session token table)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.Sessions', 'U') IS NULL
BEGIN
    CREATE TABLE Sessions (
        Token      NVARCHAR(255) PRIMARY KEY,   -- the session token itself IS the primary key
        CustomerId INT           NOT NULL,
        ExpiresAt  DATETIME2     NOT NULL,

        CONSTRAINT FK_Sessions_Customers
            FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
            ON DELETE CASCADE   -- delete a customer -> their sessions go too
    );
END
GO

-- -----------------------------------------------------------------------------
-- Orders
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
    CREATE TABLE Orders (
        Id                 NVARCHAR(50)   PRIMARY KEY,   -- order ids are strings, not auto-numbers
        PlacedAt           DATETIME2      NOT NULL,
        Total              DECIMAL(18,2)  NOT NULL,
        Status             NVARCHAR(50)   NOT NULL DEFAULT 'Pending',
        PaymentMethod      NVARCHAR(50)   NOT NULL DEFAULT 'COD',
        PaymentStatus      NVARCHAR(50)   NOT NULL DEFAULT 'COD',
        RazorpayOrderId    NVARCHAR(255)  NULL,
        RazorpayPaymentId  NVARCHAR(255)  NULL,
        CustomerId         INT            NULL,          -- nullable: guest checkouts have no CustomerId
        Name               NVARCHAR(255)  NOT NULL,
        Phone              NVARCHAR(50)   NOT NULL,
        Email              NVARCHAR(255)  NOT NULL,
        AddressLine        NVARCHAR(500)  NOT NULL,
        City               NVARCHAR(255)  NOT NULL,
        State              NVARCHAR(255)  NOT NULL,
        Pincode            NVARCHAR(20)   NOT NULL,

        CONSTRAINT FK_Orders_Customers
            FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
            ON DELETE SET NULL   -- delete a customer -> keep their old orders, just unlink them
    );
END
GO

-- -----------------------------------------------------------------------------
-- OrderItems  (the products inside each order)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.OrderItems', 'U') IS NULL
BEGIN
    CREATE TABLE OrderItems (
        Id        INT IDENTITY(1,1) PRIMARY KEY,
        OrderId   NVARCHAR(50)   NOT NULL,
        ProductId NVARCHAR(50)   NOT NULL,   -- snapshot of the product id at time of order, not a live FK
        Name      NVARCHAR(255)  NOT NULL,
        TierLabel NVARCHAR(100)  NOT NULL,
        Image     NVARCHAR(1000) NOT NULL,
        Price     DECIMAL(18,2)  NOT NULL,
        Qty       INT            NOT NULL,

        CONSTRAINT FK_OrderItems_Orders
            FOREIGN KEY (OrderId) REFERENCES Orders(Id)
            ON DELETE CASCADE   -- delete an order -> its line items go too
    );
END
GO

-- -----------------------------------------------------------------------------
-- Products
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
    CREATE TABLE Products (
        Id             INT IDENTITY(1,1) PRIMARY KEY,
        Tier           INT            NOT NULL,
        TierLabel      NVARCHAR(100)  NOT NULL,
        Name           NVARCHAR(255)  NOT NULL,
        Slug           NVARCHAR(255)  NOT NULL,
        Emotion        NVARCHAR(MAX)  NOT NULL,                  -- JSON array of category slugs, e.g. ["anxious"]
        Festival       NVARCHAR(MAX)  NOT NULL DEFAULT '[]',     -- JSON array of category slugs, e.g. ["diwali"]
        Occasion       NVARCHAR(MAX)  NOT NULL DEFAULT '[]',     -- JSON array of category slugs, e.g. ["wedding"]
        Price          DECIMAL(18,2)  NOT NULL,
        CostPrice      DECIMAL(18,2)  NOT NULL,
        Description    NVARCHAR(MAX)  NOT NULL,
        Items          NVARCHAR(MAX)  NOT NULL,                  -- JSON array of strings
        Image          NVARCHAR(1000) NOT NULL,
        Images         NVARCHAR(MAX)  NOT NULL,                  -- JSON array of strings
        Specifications NVARCHAR(MAX)  NOT NULL,                  -- JSON array of strings
        SellerName     NVARCHAR(255)  NOT NULL DEFAULT 'Snekart',
        SellerRating   DECIMAL(18,2)  NOT NULL,
        Badge          NVARCHAR(100)  NULL,
        InStock        BIT            NOT NULL DEFAULT 1
    );

    -- No two products can share a slug (used in the product page URL)
    CREATE UNIQUE INDEX IX_Products_Slug ON Products(Slug);
END
GO

-- -----------------------------------------------------------------------------
-- ProductImages  (uploaded image files, stored as raw bytes)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.ProductImages', 'U') IS NULL
BEGIN
    CREATE TABLE ProductImages (
        Id          UNIQUEIDENTIFIER PRIMARY KEY,
        Data        VARBINARY(MAX)   NOT NULL,
        ContentType NVARCHAR(100)    NOT NULL
    );
END
GO

-- -----------------------------------------------------------------------------
-- BlogPosts
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.BlogPosts', 'U') IS NULL
BEGIN
    CREATE TABLE BlogPosts (
        Id                 INT IDENTITY(1,1) PRIMARY KEY,
        Title              NVARCHAR(500)  NOT NULL,
        Slug               NVARCHAR(255)  NOT NULL,
        Category           NVARCHAR(100)  NOT NULL,
        Emotion            NVARCHAR(MAX)  NOT NULL,   -- JSON array of strings
        Excerpt            NVARCHAR(MAX)  NOT NULL,
        Content            NVARCHAR(MAX)  NOT NULL,
        Author             NVARCHAR(255)  NOT NULL DEFAULT 'Snekart Team',
        ReadTime           NVARCHAR(50)   NOT NULL,
        Image              NVARCHAR(1000) NOT NULL,
        Video              NVARCHAR(1000) NULL,
        PublishedAt        DATETIME2      NOT NULL,
        RelatedProductIds  NVARCHAR(MAX)  NOT NULL    -- JSON array of ints, e.g. [1,2,3]
    );

    -- No two blog posts can share a slug
    CREATE UNIQUE INDEX IX_BlogPosts_Slug ON BlogPosts(Slug);
END
GO

-- -----------------------------------------------------------------------------
-- Reviews
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.Reviews', 'U') IS NULL
BEGIN
    CREATE TABLE Reviews (
        Id           INT IDENTITY(1,1) PRIMARY KEY,
        ProductId    INT            NOT NULL,   -- not a real FOREIGN KEY on purpose (matches the old design) — just indexed for fast lookups
        CustomerName NVARCHAR(255)  NOT NULL,
        Rating       INT            NOT NULL,
        Comment      NVARCHAR(MAX)  NOT NULL,
        Images       NVARCHAR(MAX)  NOT NULL,    -- JSON array of image URLs
        CreatedAt    DATETIME2      NOT NULL
    );

    -- Speeds up "get all reviews for this product" lookups
    CREATE INDEX IX_Reviews_ProductId ON Reviews(ProductId);
END
GO

-- -----------------------------------------------------------------------------
-- Videos  (same idea as ProductImages, for uploaded video files)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.Videos', 'U') IS NULL
BEGIN
    CREATE TABLE Videos (
        Id          UNIQUEIDENTIFIER PRIMARY KEY,
        Data        VARBINARY(MAX)   NOT NULL,
        ContentType NVARCHAR(100)    NOT NULL
    );
END
GO

-- -----------------------------------------------------------------------------
-- NewsletterSubscribers
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.NewsletterSubscribers', 'U') IS NULL
BEGIN
    CREATE TABLE NewsletterSubscribers (
        Id                INT IDENTITY(1,1) PRIMARY KEY,
        Email             NVARCHAR(255)     NOT NULL,
        SubscribedAt      DATETIME2         NOT NULL,
        UnsubscribeToken  UNIQUEIDENTIFIER  NOT NULL
    );

    -- No two subscribers can share an email
    CREATE UNIQUE INDEX IX_NewsletterSubscribers_Email ON NewsletterSubscribers(Email);
    -- Not unique on purpose (matches the old design) — just indexed for fast lookups by token
    CREATE INDEX IX_NewsletterSubscribers_UnsubscribeToken ON NewsletterSubscribers(UnsubscribeToken);
END
GO

-- -----------------------------------------------------------------------------
-- Categories  (admin-managed values for Products.Emotion/Festival/Occasion)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE Categories (
        Id         INT IDENTITY(1,1) PRIMARY KEY,
        Type       NVARCHAR(20)   NOT NULL,   -- 'Emotion' | 'Festival' | 'Occasion' — fixed set, not admin-managed itself
        Name       NVARCHAR(100)  NOT NULL,   -- display label, editable
        Slug       NVARCHAR(100)  NOT NULL,   -- stable identifier stored in Products' tag lists, never changes after creation
        CreatedAt  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
    );

    -- A given type can't have the same slug twice (e.g. two "Emotion" categories both named "Happy")
    CREATE UNIQUE INDEX IX_Categories_Type_Slug ON Categories(Type, Slug);
END
GO

-- =============================================================================
-- STORED PROCEDURES — Categories
-- =============================================================================

CREATE OR ALTER PROCEDURE usp_Category_GetByType
    @Type NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Type, Name, Slug, CreatedAt
    FROM Categories
    WHERE Type = @Type
    ORDER BY Name;
END
GO

CREATE OR ALTER PROCEDURE usp_Category_Add
    @Type NVARCHAR(20),
    @Name NVARCHAR(100),
    @Slug NVARCHAR(100),
    @CreatedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Categories (Type, Name, Slug, CreatedAt)
    VALUES (@Type, @Name, @Slug, @CreatedAt);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO

-- Only Name is updatable — Slug/Type are immutable after creation (see CategoryRepository.cs).
CREATE OR ALTER PROCEDURE usp_Category_Update
    @Id INT,
    @Name NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Categories SET Name = @Name WHERE Id = @Id;

    SELECT CASE WHEN @@ROWCOUNT > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS Result;
END
GO

-- Returns 0 = not found, 1 = deleted, 2 = blocked (still referenced by a product's tag list).
CREATE OR ALTER PROCEDURE usp_Category_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Type NVARCHAR(20), @Slug NVARCHAR(100);
    SELECT @Type = Type, @Slug = Slug FROM Categories WHERE Id = @Id;

    IF @Type IS NULL
    BEGIN
        SELECT CAST(0 AS INT) AS Result;
        RETURN;
    END

    DECLARE @InUse BIT = 0;

    IF @Type = 'Emotion' AND EXISTS (
        SELECT 1 FROM Products p CROSS APPLY OPENJSON(p.Emotion) j WHERE j.value = @Slug
    )
        SET @InUse = 1;

    IF @Type = 'Festival' AND EXISTS (
        SELECT 1 FROM Products p CROSS APPLY OPENJSON(p.Festival) j WHERE j.value = @Slug
    )
        SET @InUse = 1;

    IF @Type = 'Occasion' AND EXISTS (
        SELECT 1 FROM Products p CROSS APPLY OPENJSON(p.Occasion) j WHERE j.value = @Slug
    )
        SET @InUse = 1;

    IF @InUse = 1
    BEGIN
        SELECT CAST(2 AS INT) AS Result;
        RETURN;
    END

    DELETE FROM Categories WHERE Id = @Id;
    SELECT CAST(1 AS INT) AS Result;
END
GO

-- =============================================================================
-- STORED PROCEDURES — Products
-- =============================================================================

CREATE OR ALTER PROCEDURE usp_Product_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Tier, TierLabel, Name, Slug, Emotion, Festival, Occasion, Price, CostPrice, Description,
           Items, Image, Images, Specifications, SellerName, SellerRating, Badge, InStock
    FROM Products
    ORDER BY Tier, Id;
END
GO

CREATE OR ALTER PROCEDURE usp_Product_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Tier, TierLabel, Name, Slug, Emotion, Festival, Occasion, Price, CostPrice, Description,
           Items, Image, Images, Specifications, SellerName, SellerRating, Badge, InStock
    FROM Products
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE usp_Product_GetBySlug
    @Slug NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Tier, TierLabel, Name, Slug, Emotion, Festival, Occasion, Price, CostPrice, Description,
           Items, Image, Images, Specifications, SellerName, SellerRating, Badge, InStock
    FROM Products
    WHERE Slug = @Slug;
END
GO

CREATE OR ALTER PROCEDURE usp_Product_GetByIds
    @Ids NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Tier, TierLabel, Name, Slug, Emotion, Festival, Occasion, Price, CostPrice, Description,
           Items, Image, Images, Specifications, SellerName, SellerRating, Badge, InStock
    FROM Products
    WHERE Id IN (SELECT value FROM OPENJSON(@Ids));
END
GO

CREATE OR ALTER PROCEDURE usp_Product_Add
    @Tier INT,
    @TierLabel NVARCHAR(100),
    @Name NVARCHAR(255),
    @Slug NVARCHAR(255),
    @Emotion NVARCHAR(MAX),
    @Festival NVARCHAR(MAX),
    @Occasion NVARCHAR(MAX),
    @Price DECIMAL(18,2),
    @CostPrice DECIMAL(18,2),
    @Description NVARCHAR(MAX),
    @Items NVARCHAR(MAX),
    @Image NVARCHAR(1000),
    @Images NVARCHAR(MAX),
    @Specifications NVARCHAR(MAX),
    @SellerName NVARCHAR(255),
    @SellerRating DECIMAL(18,2),
    @Badge NVARCHAR(100) = NULL,
    @InStock BIT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Products (Tier, TierLabel, Name, Slug, Emotion, Festival, Occasion, Price, CostPrice, Description,
                           Items, Image, Images, Specifications, SellerName, SellerRating, Badge, InStock)
    VALUES (@Tier, @TierLabel, @Name, @Slug, @Emotion, @Festival, @Occasion, @Price, @CostPrice, @Description,
            @Items, @Image, @Images, @Specifications, @SellerName, @SellerRating, @Badge, @InStock);
END
GO

CREATE OR ALTER PROCEDURE usp_Product_Update
    @Id INT,
    @Tier INT,
    @TierLabel NVARCHAR(100),
    @Name NVARCHAR(255),
    @Slug NVARCHAR(255),
    @Emotion NVARCHAR(MAX),
    @Festival NVARCHAR(MAX),
    @Occasion NVARCHAR(MAX),
    @Price DECIMAL(18,2),
    @CostPrice DECIMAL(18,2),
    @Description NVARCHAR(MAX),
    @Items NVARCHAR(MAX),
    @Image NVARCHAR(1000),
    @Images NVARCHAR(MAX),
    @Specifications NVARCHAR(MAX),
    @SellerName NVARCHAR(255),
    @SellerRating DECIMAL(18,2),
    @Badge NVARCHAR(100) = NULL,
    @InStock BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Products
    SET Tier           = @Tier,
        TierLabel      = @TierLabel,
        Name           = @Name,
        Slug           = @Slug,
        Emotion        = @Emotion,
        Festival       = @Festival,
        Occasion       = @Occasion,
        Price          = @Price,
        CostPrice      = @CostPrice,
        Description    = @Description,
        Items          = @Items,
        Image          = @Image,
        Images         = @Images,
        Specifications = @Specifications,
        SellerName     = @SellerName,
        SellerRating   = @SellerRating,
        Badge          = @Badge,
        InStock        = @InStock
    WHERE Id = @Id;

    SELECT CASE WHEN @@ROWCOUNT > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS Result;
END
GO
