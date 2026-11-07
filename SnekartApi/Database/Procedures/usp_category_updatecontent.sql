-- Sets a category's landing-page content JSON (NULL clears it back to auto-generated text).
CREATE OR REPLACE FUNCTION usp_category_updatecontent(p_id INT, p_content TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE categories SET content = p_content WHERE id = p_id;
    RETURN FOUND;
END;
$$;
