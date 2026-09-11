CREATE OR REPLACE FUNCTION usp_product_update(
    p_id INT, p_tier INT, p_tierlabel VARCHAR(100), p_name VARCHAR(255), p_slug VARCHAR(255),
    p_emotion TEXT, p_festival TEXT, p_occasion TEXT,
    p_price NUMERIC(18,2), p_costprice NUMERIC(18,2), p_description TEXT,
    p_items TEXT, p_image VARCHAR(1000), p_images TEXT, p_specifications TEXT,
    p_sellername VARCHAR(255), p_sellerrating NUMERIC(18,2),
    p_badge VARCHAR(100), p_instock BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE products
    SET tier = p_tier, tierlabel = p_tierlabel, name = p_name, slug = p_slug,
        emotion = p_emotion, festival = p_festival, occasion = p_occasion,
        price = p_price, costprice = p_costprice, description = p_description,
        items = p_items, image = p_image, images = p_images, specifications = p_specifications,
        sellername = p_sellername, sellerrating = p_sellerrating, badge = p_badge, instock = p_instock
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;
