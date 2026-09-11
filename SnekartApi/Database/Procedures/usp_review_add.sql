CREATE OR REPLACE FUNCTION usp_review_add(
    p_productid INT, p_customername VARCHAR(255), p_rating INT, p_comment TEXT, p_images TEXT, p_createdat TIMESTAMPTZ
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO reviews (productid, customername, rating, comment, images, createdat)
    VALUES (p_productid, p_customername, p_rating, p_comment, p_images, p_createdat);
END;
$$;
