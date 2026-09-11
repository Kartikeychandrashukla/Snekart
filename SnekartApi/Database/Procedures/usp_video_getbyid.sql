CREATE OR REPLACE FUNCTION usp_video_getbyid(p_id UUID)
RETURNS TABLE (id UUID, data BYTEA, contenttype VARCHAR(100))
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT v.id, v.data, v.contenttype FROM videos v WHERE v.id = p_id;
END;
$$;
