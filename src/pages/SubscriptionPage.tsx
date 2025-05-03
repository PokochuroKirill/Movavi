
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CheckCircle2, Sparkles, Star, Zap } from 'lucide-react';
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
        <div className="container max-w-5xl py-16 min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4">
              <Sparkles className="h-10 w-10 text-devhub-purple" />
            </div>
            <p className="text-lg">Загрузка данных подписки...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-devhub-purple text-white mb-6">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-medium">DevHub PRO</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-devhub-purple">
              Раскройте все возможности DevHub
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Получите доступ к премиум возможностям и поднимите свою разработку на новый уровень 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col justify-between">
              <div>
                <Card className="border-2 border-blue-200 dark:border-blue-900 shadow-xl mb-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-2xl">
                      <Star className="h-6 w-6 mr-2 text-yellow-500" />
                      Преимущества PRO
                    </CardTitle>
                    <CardDescription>
                      Все, что вы получите с PRO подпиской
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subscriptionPlan?.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">{feature.split(':')[0]}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.split(':')[1]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-amber-500" /> Возможности PRO
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Верифицированный профиль</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Расширенная персонализация профиля</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Доступ к закрытым сообществам</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Приоритетная техническая поддержка</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Card className={`shadow-lg border-2 ${isProMember ? "border-green-400 dark:border-green-700" : "border-gray-200 dark:border-gray-700"}`}>
                <CardHeader className={`${isProMember ? "bg-gradient-to-r from-blue-500 to-green-500 text-white" : "bg-gradient-to-r from-blue-500 to-devhub-purple text-white"}`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-2xl">
                      {isProMember ? (
                        <>
                          <CheckCircle className="h-6 w-6 mr-2" />
                          Ваша подписка PRO
                        </>
                      ) : (
                        <>
                          <Star className="h-6 w-6 mr-2" />
                          Подписка PRO
                        </>
                      )}
                    </CardTitle>
                    <div className="text-3xl font-bold">
                      {subscriptionPlan?.price} ₽
                      <span className="text-sm font-normal ml-1">/месяц</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isProMember ? (
                    <CurrentSubscription subscription={subscription} />
                  ) : (
                    <SubscriptionForm planId={subscriptionPlan?.id} price={subscriptionPlan?.price || 159} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Testimonials section */}
          <div className="mt-24">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Что говорят наши PRO-пользователи</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Узнайте, что думают о подписке PRO другие разработчики</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Александр М.",
                  role: "Frontend Developer",
                  text: "PRO подписка изменила подход к моей работе. Расширенный доступ к сообществам дал мне возможность найти решение для самых сложных задач."
                },
                {
                  name: "Екатерина В.",
                  role: "Full Stack Developer",
                  text: "Верификация профиля помогла мне быстрее установить профессиональные контакты. Определенно стоит своих денег!"
                },
                {
                  name: "Дмитрий К.",
                  role: "Backend Developer",
                  text: "Приоритетная поддержка спасла меня несколько раз во время срочных проектов. Рекомендую подписку всем, кто ценит свое время."
                }
              ].map((testimonial, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-md">
                  <CardContent className="pt-6">
                    <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.text}"</p>
                    <div className="mt-4 flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-devhub-purple h-10 w-10 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-24">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Часто задаваемые вопросы</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Все, что вы хотели знать о DevHub PRO</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  question: "Как мне получить верифицированный профиль?",
                  answer: "После оплаты PRO-подписки ваш профиль будет автоматически верифицирован в течение 24 часов."
                },
                {
                  question: "Могу ли я отменить подписку в любой момент?",
                  answer: "Да, вы можете отменить подписку в любое время через настройки вашего аккаунта."
                },
                {
                  question: "Что включает в себя расширенная персонализация профиля?",
                  answer: "Доступ к премиум темам оформления, возможность добавления портфолио с расширенным описанием и интеграция внешних ссылок."
                },
                {
                  question: "Какие закрытые сообщества доступны с PRO подпиской?",
                  answer: "Вы получите доступ к профессиональным сообществам по различным технологиям с участием экспертов отрасли."
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-4">Готовы перейти на новый уровень?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к сообществу PRO-разработчиков и раскройте свой потенциал
            </p>
            {!isProMember && (
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-devhub-purple hover:opacity-90 transition-opacity">
                Оформить PRO подписку сейчас
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
