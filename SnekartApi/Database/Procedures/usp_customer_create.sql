CREATE OR REPLACE FUNCTION usp_customer_create(
    p_name VARCHAR(255), p_email VARCHAR(255), p_passwordhash VARCHAR(255),
    p_level VARCHAR(50), p_createdat TIMESTAMPTZ
) RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    new_id INT;
BEGIN
    INSERT INTO customers (name, email, passwordhash, level, createdat)
    VALUES (p_name, p_email, p_passwordhash, p_level, p_createdat)
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;
