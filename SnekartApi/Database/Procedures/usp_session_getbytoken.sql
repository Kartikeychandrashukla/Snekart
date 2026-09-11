-- Session has no id column of its own (Token is the primary key), and none of its columns
-- collide with Customer's, so this can return a plain joined table — no aliasing tricks
-- needed (contrast with the Order/OrderItem queries, which do need them).
CREATE OR REPLACE FUNCTION usp_session_getbytoken(p_token VARCHAR(255))
RETURNS TABLE (
    token VARCHAR(255), customerid INT, expiresat TIMESTAMPTZ,
    id INT, name VARCHAR(255), email VARCHAR(255), passwordhash VARCHAR(255), level VARCHAR(50), createdat TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.token, s.customerid, s.expiresat,
           c.id, c.name, c.email, c.passwordhash, c.level, c.createdat
    FROM sessions s
    JOIN customers c ON c.id = s.customerid
    WHERE s.token = p_token;
END;
$$;
