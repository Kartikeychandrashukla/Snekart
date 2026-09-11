-- See usp_order_getbyid.sql for why the item columns use unique item* names here.
CREATE OR REPLACE FUNCTION usp_order_getbycustomer(p_customerid INT)
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
    WHERE o.customerid = p_customerid
    ORDER BY o.placedat DESC;
END;
$$;
