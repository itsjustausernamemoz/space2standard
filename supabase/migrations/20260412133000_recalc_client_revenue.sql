-- Recalculate total_revenue for all clients based strictly on PAID invoices
UPDATE public.clients c
SET total_revenue = (
    SELECT COALESCE(SUM(d.grand_total), 0)
    FROM public.documents d
    JOIN public.orders o ON d.order_id = o.id
    WHERE o.customer_email = c.email 
      AND d.type = 'invoice' 
      AND d.is_paid = true
);
