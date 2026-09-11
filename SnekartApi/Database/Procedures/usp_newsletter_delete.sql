CREATE OR REPLACE FUNCTION usp_newsletter_delete(p_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM newslettersubscribers WHERE id = p_id;
    RETURN FOUND;
END;
$$;
