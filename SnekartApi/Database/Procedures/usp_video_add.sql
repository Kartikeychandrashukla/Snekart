CREATE OR REPLACE FUNCTION usp_video_add(p_id UUID, p_data BYTEA, p_contenttype VARCHAR(100))
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO videos (id, data, contenttype) VALUES (p_id, p_data, p_contenttype);
END;
$$;
