CREATE OR REPLACE FUNCTION usp_orderitem_add(
    p_orderid VARCHAR(50), p_productid VARCHAR(50), p_name VARCHAR(255),
    p_tierlabel VARCHAR(100), p_image VARCHAR(1000), p_price NUMERIC(18,2), p_qty INT
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orderitems (orderid, productid, name, tierlabel, image, price, qty)
    VALUES (p_orderid, p_productid, p_name, p_tierlabel, p_image, p_price, p_qty);
END;
$$;
