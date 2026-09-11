CREATE OR REPLACE FUNCTION usp_product_getall()
RETURNS TABLE (
    id INT, tier INT, tierlabel VARCHAR(100), name VARCHAR(255), slug VARCHAR(255),
    emotion TEXT, festival TEXT, occasion TEXT, price NUMERIC(18,2), costprice NUMERIC(18,2),
    description TEXT, items TEXT, image VARCHAR(1000), images TEXT, specifications TEXT,
    sellername VARCHAR(255), sellerrating NUMERIC(18,2), badge VARCHAR(100), instock BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.tier, p.tierlabel, p.name, p.slug, p.emotion, p.festival, p.occasion,
           p.price, p.costprice, p.description, p.items, p.image, p.images, p.specifications,
           p.sellername, p.sellerrating, p.badge, p.instock
    FROM products p
    ORDER BY p.tier, p.id;
END;
$$;
