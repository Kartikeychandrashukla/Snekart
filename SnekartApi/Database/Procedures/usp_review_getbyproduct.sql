CREATE OR REPLACE FUNCTION usp_review_getbyproduct(p_productid INT)
RETURNS TABLE (id INT, productid INT, customername VARCHAR(255), rating INT, comment TEXT, images TEXT, createdat TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.productid, r.customername, r.rating, r.comment, r.images, r.createdat
    FROM reviews r
    WHERE r.productid = p_productid
    ORDER BY r.createdat DESC;
END;
$$;
