CREATE OR REPLACE FUNCTION usp_order_addheader(
    p_id VARCHAR(50), p_placedat TIMESTAMPTZ, p_total NUMERIC(18,2), p_status VARCHAR(50),
    p_paymentmethod VARCHAR(50), p_paymentstatus VARCHAR(50),
    p_razorpayorderid VARCHAR(255), p_razorpaypaymentid VARCHAR(255), p_customerid INT,
    p_name VARCHAR(255), p_phone VARCHAR(50), p_email VARCHAR(255),
    p_addressline VARCHAR(500), p_city VARCHAR(255), p_state VARCHAR(255), p_pincode VARCHAR(20)
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO orders (id, placedat, total, status, paymentmethod, paymentstatus,
                         razorpayorderid, razorpaypaymentid, customerid,
                         name, phone, email, addressline, city, state, pincode)
    VALUES (p_id, p_placedat, p_total, p_status, p_paymentmethod, p_paymentstatus,
            p_razorpayorderid, p_razorpaypaymentid, p_customerid,
            p_name, p_phone, p_email, p_addressline, p_city, p_state, p_pincode);
END;
$$;
