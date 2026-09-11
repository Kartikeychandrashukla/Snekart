-- Not present in the old SQL Server scripts (the schema file's own header noted it as
-- missing) — this is a plain existence-checked delete inferred from ProductRepository.cs.
CREATE OR REPLACE FUNCTION usp_product_delete(p_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM products WHERE id = p_id;
    RETURN FOUND;
END;
$$;
