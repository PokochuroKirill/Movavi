
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProBenefitsCard from '@/components/subscription/ProBenefitsCard';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import CurrentSubscription from '@/components/subscription/CurrentSubscription';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isProMember, setIsProMember] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchSubscriptionStatus = async () => {
      setLoading(true);
      try {
        // Check if user has PRO status
        const { data: proStatus, error: proError } = await supabase
          .rpc('has_pro_access', { user_id: user.id });

        if (proError) throw proError;
        setIsProMember(proStatus || false);

        // Get subscription details if user is pro
        if (proStatus) {
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select(`
              *,
              subscription_plans(*)
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('end_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (subError) throw subError;
          setSubscription(subData);
          setSubscriptionPlan(subData?.subscription_plans);
        }

        // Get plan information regardless
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'PRO')
          .single();

        if (planError) throw planError;
        setSubscriptionPlan(planData);

      } catch (error: any) {
        console.error('Error fetching subscription:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось проверить статус подписки",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, navigate, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-10">
          <div className="flex items-center justify-center py-20">
            <p className="text-lg text-gray-500">Загрузка данных подписки...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-2">Подписка DevHub PRO</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Получите доступ к расширенным возможностям и дополнительным функциям
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ProBenefitsCard plan={subscriptionPlan} />
          </div>

          <div>
            {isProMember ? (
              <CurrentSubscription subscription={subscription} />
            ) : (
              <SubscriptionForm planId={subscriptionPlan?.id} price={subscriptionPlan?.price || 159} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
