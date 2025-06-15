
-- Создание таблицы уведомлений
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Включаем RLS для уведомлений
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Политики для уведомлений
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Создание таблицы логов действий администраторов
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для логов (только админы могут видеть)
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Добавляем новые поля в таблицу profiles для расширенного управления
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Функция для создания уведомления
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  action_url TEXT DEFAULT NULL,
  expires_hours INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  expires_time TIMESTAMP WITH TIME ZONE;
BEGIN
  IF expires_hours IS NOT NULL THEN
    expires_time := now() + (expires_hours || ' hours')::interval;
  END IF;
  
  INSERT INTO public.notifications (
    user_id, title, message, type, action_url, expires_at
  ) VALUES (
    target_user_id, notification_title, notification_message, notification_type, action_url, expires_time
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Функция для блокировки пользователя
CREATE OR REPLACE FUNCTION public.ban_user(
  target_user_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
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
  
  -- Обновляем профиль пользователя
  UPDATE public.profiles
  SET 
    is_banned = true,
    ban_reason = reason,
    banned_at = now(),
    banned_by = auth.uid()
  WHERE id = target_user_id;
  
  -- Логируем действие
  INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(), 
    'USER_BANNED', 
    target_user_id, 
    jsonb_build_object('reason', reason)
  );
  
  -- Создаем уведомление для пользователя
  PERFORM public.create_notification(
    target_user_id,
    'Аккаунт заблокирован',
    CASE 
      WHEN reason IS NOT NULL THEN 'Ваш аккаунт был заблокирован. Причина: ' || reason
      ELSE 'Ваш аккаунт был заблокирован администратором'
    END,
    'error'
  );
  
  RETURN true;
END;
$$;

-- Функция для разблокировки пользователя
CREATE OR REPLACE FUNCTION public.unban_user(target_user_id UUID)
RETURNS BOOLEAN
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
  
  -- Обновляем профиль пользователя
  UPDATE public.profiles
  SET 
    is_banned = false,
    ban_reason = NULL,
    banned_at = NULL,
    banned_by = NULL
  WHERE id = target_user_id;
  
  -- Логируем действие
  INSERT INTO public.admin_logs (admin_id, action, target_user_id)
  VALUES (auth.uid(), 'USER_UNBANNED', target_user_id);
  
  -- Создаем уведомление для пользователя
  PERFORM public.create_notification(
    target_user_id,
    'Аккаунт разблокирован',
    'Ваш аккаунт был разблокирован администратором',
    'success'
  );
  
  RETURN true;
END;
$$;

-- Функция для массовой отправки уведомлений
CREATE OR REPLACE FUNCTION public.send_mass_notification(
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  target_verified_only BOOLEAN DEFAULT false,
  target_pro_only BOOLEAN DEFAULT false
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile RECORD;
  notification_count INTEGER := 0;
  target_user RECORD;
BEGIN
  -- Проверяем, что текущий пользователь - администратор
  SELECT * INTO admin_profile FROM public.profiles WHERE id = auth.uid() AND is_admin = true;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Выбираем целевых пользователей
  FOR target_user IN 
    SELECT id FROM public.profiles 
    WHERE is_banned = false
    AND (target_verified_only = false OR is_verified = true)
    AND (target_pro_only = false OR is_pro = true)
  LOOP
    PERFORM public.create_notification(
      target_user.id,
      notification_title,
      notification_message,
      notification_type
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  -- Логируем массовую отправку
  INSERT INTO public.admin_logs (admin_id, action, details)
  VALUES (
    auth.uid(), 
    'MASS_NOTIFICATION_SENT', 
    jsonb_build_object(
      'count', notification_count,
      'title', notification_title,
      'verified_only', target_verified_only,
      'pro_only', target_pro_only
    )
  );
  
  RETURN notification_count;
END;
$$;

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
