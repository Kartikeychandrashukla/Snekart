-- Returns 0 = not found, 1 = deleted, 2 = blocked (still referenced by a product's tag list).
CREATE OR REPLACE FUNCTION usp_category_delete(p_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_type VARCHAR(20);
    v_slug VARCHAR(100);
    v_inuse BOOLEAN := FALSE;
BEGIN
    SELECT type, slug INTO v_type, v_slug FROM categories WHERE id = p_id;

    IF v_type IS NULL THEN
        RETURN 0;
    END IF;

    IF v_type = 'Emotion' THEN
        SELECT EXISTS (
            SELECT 1 FROM products p, jsonb_array_elements_text(p.emotion::jsonb) j
            WHERE j = v_slug
        ) INTO v_inuse;
    ELSIF v_type = 'Festival' THEN
        SELECT EXISTS (
            SELECT 1 FROM products p, jsonb_array_elements_text(p.festival::jsonb) j
            WHERE j = v_slug
        ) INTO v_inuse;
    ELSIF v_type = 'Occasion' THEN
        SELECT EXISTS (
            SELECT 1 FROM products p, jsonb_array_elements_text(p.occasion::jsonb) j
            WHERE j = v_slug
        ) INTO v_inuse;
    END IF;

    IF v_inuse THEN
        RETURN 2;
    END IF;

    DELETE FROM categories WHERE id = p_id;
    RETURN 1;
END;
$$;
