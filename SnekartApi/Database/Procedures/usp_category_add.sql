CREATE OR REPLACE FUNCTION usp_category_add(
    p_type VARCHAR(20), p_name VARCHAR(100), p_slug VARCHAR(100), p_createdat TIMESTAMPTZ
) RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    new_id INT;
BEGIN
    INSERT INTO categories (type, name, slug, createdat)
    VALUES (p_type, p_name, p_slug, p_createdat)
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;
