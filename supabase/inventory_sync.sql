CREATE OR REPLACE FUNCTION public.mark_order_completed(target_order_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
BEGIN
  -- Verify the order isn't already completed
  IF EXISTS (SELECT 1 FROM orders WHERE id = target_order_id AND status = 'completed') THEN
     RETURN false;
  END IF;

  -- Update order status to completed
  UPDATE orders SET status = 'completed', updated_at = now() WHERE id = target_order_id;

  -- Loop through all items in the order
  FOR item IN SELECT product_id, quantity FROM order_items WHERE order_id = target_order_id
  LOOP
     IF item.product_id IS NOT NULL THEN
        -- Safely decrement stock quantity, preventing negative stock just in case it wasn't tracked properly
        UPDATE products 
        SET stock_quantity = GREATEST(stock_quantity - item.quantity, 0),
            updated_at = now()
        WHERE id = item.product_id;

        -- Record into stock_log for auditing
        INSERT INTO stock_log (product_id, change_amount, reason, admin_note)
        VALUES (
           item.product_id, 
           -item.quantity, 
           'Order Fulfillment', 
           'Auto-synced from Commission #' || substr(target_order_id::text, 1, 8)
        );
     END IF;
  END LOOP;

  RETURN true;
END;
$$;
