-- Run this once against your SQL Server database (e.g. snekartdb) to create every table
-- the app needs. Order matters below: a table with a FOREIGN KEY must be created AFTER
-- the table it points to (e.g. Sessions needs Customers to exist first).

-- ============================================================
-- Customers
-- ============================================================
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


-- ============================================================
-- Sessions  (the login-session token table)
-- ============================================================
CREATE TABLE Sessions (
    Token      NVARCHAR(255) PRIMARY KEY,   -- the session token itself IS the primary key
    CustomerId INT           NOT NULL,
    ExpiresAt  DATETIME2     NOT NULL,

    CONSTRAINT FK_Sessions_Customers
        FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
        ON DELETE CASCADE   -- delete a customer -> their sessions go too
);


-- ============================================================
-- Orders
-- ============================================================
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


-- ============================================================
-- OrderItems  (the products inside each order)
-- ============================================================
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


-- ============================================================
-- Products
-- ============================================================
CREATE TABLE Products (
    Id             INT IDENTITY(1,1) PRIMARY KEY,
    Tier           INT            NOT NULL,
    TierLabel      NVARCHAR(100)  NOT NULL,
    Name           NVARCHAR(255)  NOT NULL,
    Slug           NVARCHAR(255)  NOT NULL,
    Emotion        NVARCHAR(MAX)  NOT NULL,   -- JSON array of category slugs, e.g. ["anxious"]
    Festival       NVARCHAR(MAX)  NOT NULL DEFAULT '[]',   -- JSON array of category slugs, e.g. ["diwali"]
    Occasion       NVARCHAR(MAX)  NOT NULL DEFAULT '[]',   -- JSON array of category slugs, e.g. ["wedding"]
    Price          DECIMAL(18,2)  NOT NULL,
    CostPrice      DECIMAL(18,2)  NOT NULL,
    Description    NVARCHAR(MAX)  NOT NULL,
    Items          NVARCHAR(MAX)  NOT NULL,   -- JSON array of strings
    Image          NVARCHAR(1000) NOT NULL,
    Images         NVARCHAR(MAX)  NOT NULL,   -- JSON array of strings
    Specifications NVARCHAR(MAX)  NOT NULL,   -- JSON array of strings
    SellerName     NVARCHAR(255)  NOT NULL DEFAULT 'Snekart',
    SellerRating   DECIMAL(18,2)  NOT NULL,
    Badge          NVARCHAR(100)  NULL,
    InStock        BIT            NOT NULL DEFAULT 1
);

-- No two products can share a slug (used in the product page URL)
CREATE UNIQUE INDEX IX_Products_Slug ON Products(Slug);


-- ============================================================
-- ProductImages  (uploaded image files, stored as raw bytes)
-- ============================================================
CREATE TABLE ProductImages (
    Id          UNIQUEIDENTIFIER PRIMARY KEY,
    Data        VARBINARY(MAX)   NOT NULL,
    ContentType NVARCHAR(100)    NOT NULL
);


-- ============================================================
-- BlogPosts
-- ============================================================
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


-- ============================================================
-- Reviews
-- ============================================================
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


-- ============================================================
-- Videos  (same idea as ProductImages, for uploaded video files)
-- ============================================================
CREATE TABLE Videos (
    Id          UNIQUEIDENTIFIER PRIMARY KEY,
    Data        VARBINARY(MAX)   NOT NULL,
    ContentType NVARCHAR(100)    NOT NULL
);


-- ============================================================
-- NewsletterSubscribers
-- ============================================================
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


-- ============================================================
-- Categories  (admin-managed values for Products.Emotion/Festival/Occasion)
-- ============================================================
CREATE TABLE Categories (
    Id         INT IDENTITY(1,1) PRIMARY KEY,
    Type       NVARCHAR(20)   NOT NULL,   -- 'Emotion' | 'Festival' | 'Occasion' — fixed set, not admin-managed itself
    Name       NVARCHAR(100)  NOT NULL,   -- display label, editable
    Slug       NVARCHAR(100)  NOT NULL,   -- stable identifier stored in Products' tag lists, never changes after creation
    CreatedAt  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);

-- A given type can't have the same slug twice (e.g. two "Emotion" categories both named "Happy")
CREATE UNIQUE INDEX IX_Categories_Type_Slug ON Categories(Type, Slug);
