-- =============================================================================
-- Snekart – PostgreSQL table definitions
--
-- Run this once against an empty database, before anything in Procedures/.
-- Table order matters: a table with a FOREIGN KEY is created AFTER the table
-- it points to (e.g. sessions needs customers first).
--
-- All identifiers are lowercase and unquoted on purpose — Postgres folds
-- unquoted identifiers to lowercase, and Dapper maps result columns to C#
-- properties case-insensitively, so this needs zero C# model changes while
-- avoiding the bug-prone alternative of quoting every identifier everywhere
-- to preserve PascalCase.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- customers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(255)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    passwordhash  VARCHAR(255)  NOT NULL,
    level         VARCHAR(50)   NOT NULL DEFAULT 'customer',
    createdat     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- No two customers can share an email
CREATE UNIQUE INDEX IF NOT EXISTS ix_customers_email ON customers(email);

-- -----------------------------------------------------------------------------
-- sessions  (the login-session token table)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    token       VARCHAR(255) PRIMARY KEY,   -- the session token itself IS the primary key
    customerid  INT          NOT NULL,
    expiresat   TIMESTAMPTZ  NOT NULL,

    CONSTRAINT fk_sessions_customers
        FOREIGN KEY (customerid) REFERENCES customers(id)
        ON DELETE CASCADE   -- delete a customer -> their sessions go too
);

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                 VARCHAR(50)    PRIMARY KEY,   -- order ids are strings, not auto-numbers
    placedat           TIMESTAMPTZ    NOT NULL,
    total              NUMERIC(18,2)  NOT NULL,
    status             VARCHAR(50)    NOT NULL DEFAULT 'Pending',
    paymentmethod      VARCHAR(50)    NOT NULL DEFAULT 'COD',
    paymentstatus      VARCHAR(50)    NOT NULL DEFAULT 'COD',
    razorpayorderid    VARCHAR(255)   NULL,
    razorpaypaymentid  VARCHAR(255)   NULL,
    customerid         INT            NULL,          -- nullable: guest checkouts have no customerid
    name               VARCHAR(255)   NOT NULL,
    phone              VARCHAR(50)    NOT NULL,
    email              VARCHAR(255)   NOT NULL,
    addressline        VARCHAR(500)   NOT NULL,
    city               VARCHAR(255)   NOT NULL,
    state              VARCHAR(255)   NOT NULL,
    pincode            VARCHAR(20)    NOT NULL,

    CONSTRAINT fk_orders_customers
        FOREIGN KEY (customerid) REFERENCES customers(id)
        ON DELETE SET NULL   -- delete a customer -> keep their old orders, just unlink them
);

-- -----------------------------------------------------------------------------
-- orderitems  (the products inside each order)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orderitems (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    orderid    VARCHAR(50)    NOT NULL,
    productid  VARCHAR(50)    NOT NULL,   -- snapshot of the product id at time of order, not a live FK
    name       VARCHAR(255)   NOT NULL,
    tierlabel  VARCHAR(100)   NOT NULL,
    image      VARCHAR(1000)  NOT NULL,
    price      NUMERIC(18,2)  NOT NULL,
    qty        INT            NOT NULL,

    CONSTRAINT fk_orderitems_orders
        FOREIGN KEY (orderid) REFERENCES orders(id)
        ON DELETE CASCADE   -- delete an order -> its line items go too
);

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tier            INT            NOT NULL,
    tierlabel       VARCHAR(100)   NOT NULL,
    name            VARCHAR(255)   NOT NULL,
    slug            VARCHAR(255)   NOT NULL,
    emotion         TEXT           NOT NULL,                  -- JSON array of category slugs, e.g. ["anxious"]
    festival        TEXT           NOT NULL DEFAULT '[]',     -- JSON array of category slugs, e.g. ["diwali"]
    occasion        TEXT           NOT NULL DEFAULT '[]',     -- JSON array of category slugs, e.g. ["wedding"]
    price           NUMERIC(18,2)  NOT NULL,
    costprice       NUMERIC(18,2)  NOT NULL,
    description     TEXT           NOT NULL,
    items           TEXT           NOT NULL,                  -- JSON array of strings
    image           VARCHAR(1000)  NOT NULL,
    images          TEXT           NOT NULL,                  -- JSON array of strings
    specifications  TEXT           NOT NULL,                  -- JSON array of strings
    sellername      VARCHAR(255)   NOT NULL DEFAULT 'Snekart',
    sellerrating    NUMERIC(18,2)  NOT NULL,
    badge           VARCHAR(100)   NULL,
    instock         BOOLEAN        NOT NULL DEFAULT TRUE
);

-- No two products can share a slug (used in the product page URL)
CREATE UNIQUE INDEX IF NOT EXISTS ix_products_slug ON products(slug);

-- -----------------------------------------------------------------------------
-- productimages  (uploaded image files, stored as raw bytes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productimages (
    id           UUID  PRIMARY KEY,
    data         BYTEA NOT NULL,
    contenttype  VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------------------------------
-- blogposts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogposts (
    id                 INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title              VARCHAR(500)   NOT NULL,
    slug               VARCHAR(255)   NOT NULL,
    category           VARCHAR(100)   NOT NULL,
    emotion            TEXT           NOT NULL,   -- JSON array of strings
    excerpt            TEXT           NOT NULL,
    content            TEXT           NOT NULL,
    author             VARCHAR(255)   NOT NULL DEFAULT 'Snekart Team',
    readtime           VARCHAR(50)    NOT NULL,
    image              VARCHAR(1000)  NOT NULL,
    video              VARCHAR(1000)  NULL,
    publishedat        TIMESTAMPTZ    NOT NULL,
    relatedproductids  TEXT           NOT NULL    -- JSON array of ints, e.g. [1,2,3]
);

-- No two blog posts can share a slug
CREATE UNIQUE INDEX IF NOT EXISTS ix_blogposts_slug ON blogposts(slug);

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    productid     INT            NOT NULL,   -- not a real FOREIGN KEY on purpose (matches the old design) — just indexed for fast lookups
    customername  VARCHAR(255)   NOT NULL,
    rating        INT            NOT NULL,
    comment       TEXT           NOT NULL,
    images        TEXT           NOT NULL,   -- JSON array of image URLs
    createdat     TIMESTAMPTZ    NOT NULL
);

-- Speeds up "get all reviews for this product" lookups
CREATE INDEX IF NOT EXISTS ix_reviews_productid ON reviews(productid);

-- -----------------------------------------------------------------------------
-- videos  (same idea as productimages, for uploaded video files)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
    id           UUID  PRIMARY KEY,
    data         BYTEA NOT NULL,
    contenttype  VARCHAR(100) NOT NULL
);

-- -----------------------------------------------------------------------------
-- newslettersubscribers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newslettersubscribers (
    id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email             VARCHAR(255)  NOT NULL,
    subscribedat      TIMESTAMPTZ   NOT NULL,
    unsubscribetoken  UUID          NOT NULL
);

-- No two subscribers can share an email
CREATE UNIQUE INDEX IF NOT EXISTS ix_newslettersubscribers_email ON newslettersubscribers(email);
-- Not unique on purpose (matches the old design) — just indexed for fast lookups by token
CREATE INDEX IF NOT EXISTS ix_newslettersubscribers_unsubscribetoken ON newslettersubscribers(unsubscribetoken);

-- -----------------------------------------------------------------------------
-- categories  (admin-managed values for products.emotion/festival/occasion)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type       VARCHAR(20)   NOT NULL,   -- 'Emotion' | 'Festival' | 'Occasion' — fixed set, not admin-managed itself
    name       VARCHAR(100)  NOT NULL,   -- display label, editable
    slug       VARCHAR(100)  NOT NULL,   -- stable identifier stored in products' tag lists, never changes after creation
    createdat  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- A given type can't have the same slug twice (e.g. two "Emotion" categories both named "Happy")
CREATE UNIQUE INDEX IF NOT EXISTS ix_categories_type_slug ON categories(type, slug);
