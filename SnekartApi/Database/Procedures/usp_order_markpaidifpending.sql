-- Gates on paymentstatus = 'Pending', not status — COD orders never have PaymentStatus
-- 'Pending' (they're 'COD' from creation), only a Razorpay order does while awaiting
-- confirmation. This makes the update atomic and idempotent: a webhook firing twice for the
-- same payment only flips it to 'Paid' (and returns TRUE) once; the second call finds
-- paymentstatus already 'Paid', updates nothing, and returns FALSE. See OrderService.cs
-- (VerifyPaymentAsync / ConfirmPaymentFromWebhookAsync), which only sends the
-- order-confirmation email when this returns TRUE.
CREATE OR REPLACE FUNCTION usp_order_markpaidifpending(p_id VARCHAR(50), p_razorpaypaymentid VARCHAR(255))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE orders
    SET paymentstatus = 'Paid', razorpaypaymentid = p_razorpaypaymentid
    WHERE id = p_id AND paymentstatus = 'Pending';

    RETURN FOUND;
END;
$$;
