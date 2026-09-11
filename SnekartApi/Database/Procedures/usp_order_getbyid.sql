-- Order.Id/Name and OrderItem.Id/Name collide, which is fine in a plain SQL Server SELECT
-- but illegal in a Postgres function's RETURNS TABLE (a named type can't have two columns
-- with the same name). So this function returns the item columns under unique internal
-- names (item*), and OrderRepository.cs re-aliases them back to Id/OrderId/Name/etc. in the
-- SELECT that calls this function — an ordinary SELECT list, unlike a function's return
-- type, is allowed to have duplicate output labels, which is exactly what Dapper's
-- QueryAsync<Order, OrderItem, Order> multi-mapping (splitOn: "Id") needs to see.
CREATE OR REPLACE FUNCTION usp_order_getbyid(p_id VARCHAR(50))
RETURNS TABLE (
    id VARCHAR(50), placedat TIMESTAMPTZ, total NUMERIC(18,2), status VARCHAR(50),
    paymentmethod VARCHAR(50), paymentstatus VARCHAR(50), razorpayorderid VARCHAR(255),
    razorpaypaymentid VARCHAR(255), customerid INT, name VARCHAR(255), phone VARCHAR(50),
    email VARCHAR(255), addressline VARCHAR(500), city VARCHAR(255), state VARCHAR(255), pincode VARCHAR(20),
    itemid INT, itemorderid VARCHAR(50), itemproductid VARCHAR(50), itemname VARCHAR(255),
    itemtierlabel VARCHAR(100), itemimage VARCHAR(1000), itemprice NUMERIC(18,2), itemqty INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.placedat, o.total, o.status, o.paymentmethod, o.paymentstatus,
           o.razorpayorderid, o.razorpaypaymentid, o.customerid, o.name, o.phone, o.email,
           o.addressline, o.city, o.state, o.pincode,
           oi.id, oi.orderid, oi.productid, oi.name, oi.tierlabel, oi.image, oi.price, oi.qty
    FROM orders o
    LEFT JOIN orderitems oi ON oi.orderid = o.id
    WHERE o.id = p_id;
END;
$$;
