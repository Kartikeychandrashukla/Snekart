-- Return columns changed (content added) — CREATE OR REPLACE can't change a function's
-- return type, so drop the old signature first.
DROP FUNCTION IF EXISTS usp_category_getbytype(VARCHAR);

CREATE OR REPLACE FUNCTION usp_category_getbytype(p_type VARCHAR(20))
RETURNS TABLE (id INT, type VARCHAR(20), name VARCHAR(100), slug VARCHAR(100), createdat TIMESTAMPTZ, content TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.type, c.name, c.slug, c.createdat, c.content
    FROM categories c
    WHERE c.type = p_type
    ORDER BY c.name;
END;
$$;
