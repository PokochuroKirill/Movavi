
-- Функция для аннулирования аккаунта (замена блокировки)
CREATE OR REPLACE FUNCTION public.nullify_account(
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
  
  -- Аннулируем аккаунт пользователя
  UPDATE public.profiles
  SET 
    is_banned = true,
    ban_reason = reason,
    banned_at = now(),
    banned_by = auth.uid(),
    -- Очищаем личные данные
    username = null,
    full_name = '- аккаунт удален',
    bio = null,
    website = null,
    location = null,
    avatar_url = null,
    banner_url = null,
    telegram = null,
    discord = null,
    github = null,
    twitter = null,
    linkedin = null
  WHERE id = target_user_id;
  
  -- Логируем действие
  INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(), 
    'ACCOUNT_NULLIFIED', 
    target_user_id, 
    jsonb_build_object('reason', reason)
  );
  
  -- Создаем уведомление для пользователя (если он еще может его получить)
  PERFORM public.create_notification(
    target_user_id,
    'Аккаунт аннулирован',
    CASE 
      WHEN reason IS NOT NULL THEN 'Ваш аккаунт был аннулирован администратором. Причина: ' || reason
      ELSE 'Ваш аккаунт был аннулирован администратором'
    END,
    'error'
  );
  
  RETURN true;
END;
$$;
