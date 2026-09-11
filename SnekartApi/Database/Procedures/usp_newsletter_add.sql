CREATE OR REPLACE FUNCTION usp_newsletter_add(p_email VARCHAR(255), p_subscribedat TIMESTAMPTZ, p_unsubscribetoken UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO newslettersubscribers (email, subscribedat, unsubscribetoken)
    VALUES (p_email, p_subscribedat, p_unsubscribetoken);
END;
$$;
