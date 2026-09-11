-- Only Name is updatable — Slug/Type are immutable after creation (see CategoryRepository.cs).
CREATE OR REPLACE FUNCTION usp_category_update(p_id INT, p_name VARCHAR(100))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE categories SET name = p_name WHERE id = p_id;
    RETURN FOUND;
END;
$$;
