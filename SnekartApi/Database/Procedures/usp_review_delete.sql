-- Review.Images holds a JSON array of URLs like "/api/uploads/image/<guid>" (see
-- UploadsController.cs). Deleting a review must also delete the productimages rows those
-- URLs point at, so a removed review doesn't leave orphaned uploaded files behind — same
-- cleanup the original SQL Server version did via OPENJSON, done here with jsonb instead.
CREATE OR REPLACE FUNCTION usp_review_delete(p_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_images TEXT;
BEGIN
    SELECT images INTO v_images FROM reviews WHERE id = p_id;

    IF v_images IS NULL THEN
        RETURN FALSE;
    END IF;

    DELETE FROM productimages
    WHERE id IN (
        SELECT (regexp_match(url, '([0-9a-fA-F-]{36})$'))[1]::uuid
        FROM jsonb_array_elements_text(v_images::jsonb) AS url
        WHERE url ~ '[0-9a-fA-F-]{36}$'
    );

    DELETE FROM reviews WHERE id = p_id;
    RETURN TRUE;
END;
$$;
