
-- Создаем таблицу для отслеживания скрытых уведомлений
CREATE TABLE public.dismissed_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Включаем RLS для таблицы скрытых уведомлений
ALTER TABLE public.dismissed_notifications ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра своих скрытых уведомлений
CREATE POLICY "Users can view their own dismissed notifications" 
  ON public.dismissed_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Политика для добавления скрытых уведомлений
CREATE POLICY "Users can dismiss their own notifications" 
  ON public.dismissed_notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Функция для полного удаления аккаунта
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid, reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile RECORD;
BEGIN
  -- Проверяем, что текущий пользователь - администратор
  SELECT * INTO admin_profile FROM public.profiles WHERE id = auth.uid() AND is_admin = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Удаляем все связанные данные пользователя
  DELETE FROM public.project_likes WHERE user_id = target_user_id;
  DELETE FROM public.project_views WHERE user_id = target_user_id;
  DELETE FROM public.saved_projects WHERE user_id = target_user_id;
  DELETE FROM public.snippet_likes WHERE user_id = target_user_id;
  DELETE FROM public.snippet_views WHERE user_id = target_user_id;
  DELETE FROM public.saved_snippets WHERE user_id = target_user_id;
  DELETE FROM public.comments WHERE user_id = target_user_id;
  DELETE FROM public.snippet_comments WHERE user_id = target_user_id;
  DELETE FROM public.community_comments WHERE user_id = target_user_id;
  DELETE FROM public.community_members WHERE user_id = target_user_id;
  DELETE FROM public.community_post_likes WHERE user_id = target_user_id;
  DELETE FROM public.user_follows WHERE follower_id = target_user_id OR following_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.dismissed_notifications WHERE user_id = target_user_id;
  DELETE FROM public.subscriptions WHERE user_id = target_user_id;
  
  -- Удаляем проекты пользователя
  DELETE FROM public.projects WHERE user_id = target_user_id;
  
  -- Удаляем сниппеты пользователя
  DELETE FROM public.snippets WHERE user_id = target_user_id;
  
  -- Удаляем посты в сообществах
  DELETE FROM public.community_posts WHERE user_id = target_user_id;
  
  -- Удаляем сообщества, созданные пользователем
  DELETE FROM public.communities WHERE creator_id = target_user_id;
  
  -- Удаляем профиль пользователя
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Логируем действие
  INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(), 
    'USER_ACCOUNT_DELETED', 
    target_user_id, 
    jsonb_build_object('reason', reason)
  );
  
  RETURN true;
END;
$$;

-- Функция для получения активных уведомлений для пользователя
CREATE OR REPLACE FUNCTION public.get_active_notifications_for_user(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  message text,
  type text,
  action_url text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.action_url,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = p_user_id
    AND (n.expires_at IS NULL OR n.expires_at > now())
    AND NOT EXISTS (
      SELECT 1 FROM public.dismissed_notifications dn 
      WHERE dn.user_id = p_user_id AND dn.notification_id = n.id
    )
  ORDER BY n.created_at DESC;
END;
$$;
