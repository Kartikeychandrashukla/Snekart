CREATE OR REPLACE FUNCTION usp_productimage_add(p_id UUID, p_data BYTEA, p_contenttype VARCHAR(100))
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO productimages (id, data, contenttype) VALUES (p_id, p_data, p_contenttype);
END;
$$;
