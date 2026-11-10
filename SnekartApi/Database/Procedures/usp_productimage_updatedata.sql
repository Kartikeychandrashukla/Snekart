-- Replaces a stored image's bytes in place (used when optimizing existing uploads, so the
-- image keeps its id and every URL pointing at it keeps working).
CREATE OR REPLACE FUNCTION usp_productimage_updatedata(p_id UUID, p_data BYTEA, p_contenttype VARCHAR(100))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE productimages SET data = p_data, contenttype = p_contenttype WHERE id = p_id;
    RETURN FOUND;
END;
$$;
