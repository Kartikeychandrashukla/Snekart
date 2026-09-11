CREATE OR REPLACE FUNCTION usp_newsletter_getbytoken(p_token UUID)
RETURNS TABLE (id INT, email VARCHAR(255), subscribedat TIMESTAMPTZ, unsubscribetoken UUID)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.email, n.subscribedat, n.unsubscribetoken
    FROM newslettersubscribers n
    WHERE n.unsubscribetoken = p_token;
END;
$$;
