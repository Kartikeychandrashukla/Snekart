CREATE OR REPLACE FUNCTION usp_blogpost_delete(p_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM blogposts WHERE id = p_id;
    RETURN FOUND;
END;
$$;
