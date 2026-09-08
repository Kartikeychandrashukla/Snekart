-- New Category procedures, plus every existing Product procedure that needed Festival/Occasion
-- added. Safe to re-run (CREATE OR ALTER).

-- ============================================================
-- Categories
-- ============================================================

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

-- ============================================================
-- Products — updated to include Festival + Occasion
-- ============================================================

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
