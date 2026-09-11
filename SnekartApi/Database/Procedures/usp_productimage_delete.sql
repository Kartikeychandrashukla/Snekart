CREATE OR REPLACE FUNCTION usp_productimage_delete(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM productimages WHERE id = p_id;
    RETURN FOUND;
END;
$$;
