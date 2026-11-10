-- Next batch of stored images worth optimizing (not yet WebP/GIF and above a size threshold),
-- ordered by id and starting after p_after so a caller can page through them. "remaining" is
-- the number of matching images from p_after onwards, including this batch.
CREATE OR REPLACE FUNCTION usp_productimage_listforoptimize(p_after UUID, p_minbytes INT, p_limit INT)
RETURNS TABLE (id UUID, remaining BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, COUNT(*) OVER () AS remaining
    FROM productimages p
    WHERE p.contenttype NOT IN ('image/webp', 'image/gif')
      AND octet_length(p.data) > p_minbytes
      AND (p_after IS NULL OR p.id > p_after)
    ORDER BY p.id
    LIMIT p_limit;
END;
$$;
