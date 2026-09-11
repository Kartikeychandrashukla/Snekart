CREATE OR REPLACE FUNCTION usp_order_updatestatus(p_id VARCHAR(50), p_status VARCHAR(50))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE orders SET status = p_status WHERE id = p_id;
    RETURN FOUND;
END;
$$;
