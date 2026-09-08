-- Run this once against an existing database that was created before the Emotion/Festival/
-- Occasion category system existed. Safe to re-run (each step checks whether it's already done).

-- Add the two new tag columns to Products
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Festival')
BEGIN
    ALTER TABLE Products ADD Festival NVARCHAR(MAX) NOT NULL DEFAULT '[]';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Occasion')
BEGIN
    ALTER TABLE Products ADD Occasion NVARCHAR(MAX) NOT NULL DEFAULT '[]';
END

-- Create the Categories table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        Id         INT IDENTITY(1,1) PRIMARY KEY,
        Type       NVARCHAR(20)   NOT NULL,
        Name       NVARCHAR(100)  NOT NULL,
        Slug       NVARCHAR(100)  NOT NULL,
        CreatedAt  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE UNIQUE INDEX IX_Categories_Type_Slug ON Categories(Type, Slug);
END
