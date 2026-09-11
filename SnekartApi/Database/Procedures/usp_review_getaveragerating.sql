CREATE OR REPLACE FUNCTION usp_review_getaveragerating(p_productid INT)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_avg NUMERIC;
BEGIN
    SELECT AVG(rating) INTO v_avg FROM reviews WHERE productid = p_productid;
    RETURN v_avg;
END;
$$;
