
-- Обновляем политику для проектов: приватные проекты видят владелец и те, на кого он подписан
DROP POLICY IF EXISTS "Users can view projects based on privacy settings" ON public.projects;

CREATE POLICY "Users can view projects based on privacy settings" 
  ON public.projects 
  FOR SELECT 
  USING (
    is_private = false 
    OR user_id = auth.uid() 
    OR (
      is_private = true 
      AND EXISTS (
        SELECT 1 FROM user_follows uf 
        WHERE uf.follower_id = projects.user_id 
        AND uf.following_id = auth.uid()
      )
    )
  );

-- Обновляем политику для сниппетов: приватные сниппеты видят владелец и те, на кого он подписан
DROP POLICY IF EXISTS "Users can view snippets based on privacy settings" ON public.snippets;

CREATE POLICY "Users can view snippets based on privacy settings" 
  ON public.snippets 
  FOR SELECT 
  USING (
    is_private = false 
    OR user_id = auth.uid() 
    OR (
      is_private = true 
      AND EXISTS (
        SELECT 1 FROM user_follows uf 
        WHERE uf.follower_id = snippets.user_id 
        AND uf.following_id = auth.uid()
      )
    )
  );

-- Обновляем политику для файлов проектов с той же логикой
DROP POLICY IF EXISTS "Users can view project files based on project privacy" ON public.project_files;

CREATE POLICY "Users can view project files based on project privacy" 
  ON public.project_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_files.project_id 
      AND (
        p.is_private = false 
        OR p.user_id = auth.uid() 
        OR (
          p.is_private = true 
          AND EXISTS (
            SELECT 1 FROM user_follows uf 
            WHERE uf.follower_id = p.user_id 
            AND uf.following_id = auth.uid()
          )
        )
      )
    )
  );
