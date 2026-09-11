CREATE OR REPLACE FUNCTION usp_session_create(p_token VARCHAR(255), p_customerid INT, p_expiresat TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO sessions (token, customerid, expiresat)
    VALUES (p_token, p_customerid, p_expiresat);
END;
$$;
