CREATE OR REPLACE FUNCTION usp_productimage_getbyid(p_id UUID)
RETURNS TABLE (id UUID, data BYTEA, contenttype VARCHAR(100))
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.data, p.contenttype FROM productimages p WHERE p.id = p_id;
END;
$$;
