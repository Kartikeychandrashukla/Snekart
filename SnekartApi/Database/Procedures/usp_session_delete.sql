CREATE OR REPLACE FUNCTION usp_session_delete(p_token VARCHAR(255))
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM sessions WHERE token = p_token;
END;
$$;
