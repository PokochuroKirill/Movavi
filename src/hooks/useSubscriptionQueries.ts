
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const checkProAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('has_pro_access', { user_id: userId });
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking PRO access:", error);
    return false;
  }
};

export const fetchSubscriptionPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return [];
  }
};

export const fetchUserSubscriptions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans(*),
        subscription_payments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    return [];
  }
};

export const fetchActiveSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans(*),
        subscription_payments(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('end_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching active subscription:", error);
    return null;
  }
};

export const useSubscription = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const submitSubscriptionRequest = async (
    userId: string,
    planId: string,
    amount: number,
    paymentMethod: string,
    receiptFile: File | null
  ) => {
    setLoading(true);
    try {
      let receiptUrl = null;
      
      // Upload receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        // Check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage
          .getBucket('subscriptions');
        
        if (bucketError) {
          console.error("Error checking bucket:", bucketError);
          // Instead of throwing an error, continue without the receipt
          toast({
            title: "Предупреждение",
            description: "Не удалось загрузить квитанцию, но заявка будет отправлена",
            variant: "destructive" // Changed from "warning" to "destructive" to match allowed variants
          });
        } else {
          try {
            // Upload file
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('subscriptions')
              .upload(filePath, receiptFile);
              
            if (uploadError) throw uploadError;
            
            // Get the public URL
            const { data: urlData } = supabase.storage
              .from('subscriptions')
              .getPublicUrl(filePath);
              
            receiptUrl = urlData.publicUrl;
          } catch (uploadError: any) {
            console.error("Error uploading receipt:", uploadError);
            // Continue without the receipt
            toast({
              title: "Предупреждение",
              description: "Не удалось загрузить квитанцию, но заявка будет отправлена",
              variant: "destructive" // Changed from "warning" to "destructive" to match allowed variants
            });
          }
        }
      }
      
      // Calculate end date (30 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      // Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount: amount,
          payment_method: paymentMethod,
          receipt_url: receiptUrl,
          status: 'pending'
        })
        .select()
        .single();
      
      if (paymentError) throw paymentError;
      
      // Create subscription (will be activated when payment is approved)
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          payment_id: paymentData.id,
          status: 'pending',
          end_date: endDate.toISOString()
        });
      
      if (subscriptionError) throw subscriptionError;
      
      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на подписку PRO отправлен и будет обработан администратором"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error submitting subscription:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить запрос на подписку",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    checkProAccess,
    fetchSubscriptionPlans,
    fetchUserSubscriptions,
    fetchActiveSubscription,
    submitSubscriptionRequest
  };
};

export default useSubscription;
