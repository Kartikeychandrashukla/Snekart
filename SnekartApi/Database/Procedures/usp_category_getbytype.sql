CREATE OR REPLACE FUNCTION usp_category_getbytype(p_type VARCHAR(20))
RETURNS TABLE (id INT, type VARCHAR(20), name VARCHAR(100), slug VARCHAR(100), createdat TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.type, c.name, c.slug, c.createdat
    FROM categories c
    WHERE c.type = p_type
    ORDER BY c.name;
END;
$$;
