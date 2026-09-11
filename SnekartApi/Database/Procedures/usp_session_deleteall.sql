CREATE OR REPLACE FUNCTION usp_session_deleteall(p_customerid INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM sessions WHERE customerid = p_customerid;
END;
$$;
