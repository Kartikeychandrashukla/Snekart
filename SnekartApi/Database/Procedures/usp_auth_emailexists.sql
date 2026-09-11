CREATE OR REPLACE FUNCTION usp_auth_emailexists(p_email VARCHAR(255))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM customers WHERE email = p_email);
END;
$$;
