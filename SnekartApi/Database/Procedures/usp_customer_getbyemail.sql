CREATE OR REPLACE FUNCTION usp_customer_getbyemail(p_email VARCHAR(255))
RETURNS TABLE (id INT, name VARCHAR(255), email VARCHAR(255), passwordhash VARCHAR(255), level VARCHAR(50), createdat TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.email, c.passwordhash, c.level, c.createdat
    FROM customers c
    WHERE c.email = p_email;
END;
$$;
