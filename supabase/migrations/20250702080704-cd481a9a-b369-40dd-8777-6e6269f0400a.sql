-- Создаем функцию для безопасного переключения подписки
CREATE OR REPLACE FUNCTION public.toggle_follow(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  is_following boolean;
BEGIN
  -- Получаем ID текущего пользователя
  current_user_id := auth.uid();
  
  -- Проверяем авторизацию
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Пользователь не авторизован';
  END IF;
  
  -- Нельзя подписаться на самого себя
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Нельзя подписаться на самого себя';
  END IF;
  
  -- Проверяем текущий статус подписки
  SELECT EXISTS (
    SELECT 1 FROM public.user_follows
    WHERE follower_id = current_user_id
    AND following_id = target_user_id
  ) INTO is_following;
  
  IF is_following THEN
    -- Отписываемся
    DELETE FROM public.user_follows
    WHERE follower_id = current_user_id
    AND following_id = target_user_id;
    
    RETURN false;
  ELSE
    -- Подписываемся
    INSERT INTO public.user_follows (follower_id, following_id)
    VALUES (current_user_id, target_user_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
    
    RETURN true;
  END IF;
END;
$$;

-- Обновляем политики для user_follows - только владелец может видеть свои подписки
DROP POLICY IF EXISTS "Users can view all follows" ON public.user_follows;

CREATE POLICY "Users can view their own follows and public counts"
  ON public.user_follows FOR SELECT
  USING (
    -- Пользователи могут видеть свои подписки/подписчиков
    follower_id = auth.uid() OR following_id = auth.uid()
  );

-- Добавляем уникальный индекс для предотвращения дублирующих подписок
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_follows_unique 
ON public.user_follows (follower_id, following_id);