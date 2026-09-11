CREATE OR REPLACE FUNCTION usp_product_add(
    p_tier INT, p_tierlabel VARCHAR(100), p_name VARCHAR(255), p_slug VARCHAR(255),
    p_emotion TEXT, p_festival TEXT, p_occasion TEXT,
    p_price NUMERIC(18,2), p_costprice NUMERIC(18,2), p_description TEXT,
    p_items TEXT, p_image VARCHAR(1000), p_images TEXT, p_specifications TEXT,
    p_sellername VARCHAR(255), p_sellerrating NUMERIC(18,2),
    p_badge VARCHAR(100) DEFAULT NULL, p_instock BOOLEAN DEFAULT TRUE
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO products (tier, tierlabel, name, slug, emotion, festival, occasion, price, costprice,
                           description, items, image, images, specifications, sellername, sellerrating,
                           badge, instock)
    VALUES (p_tier, p_tierlabel, p_name, p_slug, p_emotion, p_festival, p_occasion, p_price, p_costprice,
            p_description, p_items, p_image, p_images, p_specifications, p_sellername, p_sellerrating,
            p_badge, p_instock);
END;
$$;
