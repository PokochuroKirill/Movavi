
-- Add Row Level Security (RLS) policies for subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to see their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy that allows users to insert their own subscriptions
CREATE POLICY "Users can create their own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add Row Level Security (RLS) policies for subscription_payments table
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to see their own subscription payments
CREATE POLICY "Users can view their own subscription payments"
  ON public.subscription_payments
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy that allows users to insert their own subscription payments
CREATE POLICY "Users can create their own subscription payments"
  ON public.subscription_payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
