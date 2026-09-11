CREATE OR REPLACE FUNCTION usp_newsletter_existsbyemail(p_email VARCHAR(255))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM newslettersubscribers WHERE email = p_email);
END;
$$;
