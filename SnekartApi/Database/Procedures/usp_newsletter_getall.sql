CREATE OR REPLACE FUNCTION usp_newsletter_getall()
RETURNS TABLE (id INT, email VARCHAR(255), subscribedat TIMESTAMPTZ, unsubscribetoken UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.email, n.subscribedat, n.unsubscribetoken
    FROM newslettersubscribers n
    ORDER BY n.subscribedat DESC;
END;
$$;
