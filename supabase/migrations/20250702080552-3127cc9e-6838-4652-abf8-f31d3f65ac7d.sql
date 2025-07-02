-- Добавляем поля для приватности и файлов к проектам
ALTER TABLE public.projects 
ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN attachment_files JSONB DEFAULT NULL;

-- Добавляем поля для приватности к сниппетам
ALTER TABLE public.snippets 
ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT false;

-- Создаем таблицу для файлов проектов
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для project_files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Создаем политики для project_files
CREATE POLICY "Users can view project files based on project privacy"
  ON public.project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id
      AND (
        -- Публичные проекты доступны всем
        p.is_private = false
        OR
        -- Приватные проекты доступны автору
        p.user_id = auth.uid()
        OR
        -- Приватные проекты доступны подписчикам автора
        (p.is_private = true AND EXISTS (
          SELECT 1 FROM public.user_follows uf
          WHERE uf.following_id = p.user_id
          AND uf.follower_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can add files to their own projects"
  ON public.project_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their own projects"
  ON public.project_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id
      AND p.user_id = auth.uid()
    )
  );

-- Обновляем политики для проектов с учетом приватности
DROP POLICY IF EXISTS "Публичный доступ к проектам на чте" ON public.projects;

CREATE POLICY "Users can view projects based on privacy settings"
  ON public.projects FOR SELECT
  USING (
    -- Публичные проекты доступны всем
    is_private = false
    OR
    -- Приватные проекты доступны автору
    user_id = auth.uid()
    OR
    -- Приватные проекты доступны подписчикам автора
    (is_private = true AND EXISTS (
      SELECT 1 FROM public.user_follows uf
      WHERE uf.following_id = projects.user_id
      AND uf.follower_id = auth.uid()
    ))
  );

-- Обновляем политики для сниппетов с учетом приватности
DROP POLICY IF EXISTS "Публичный доступ к сниппетам на чт" ON public.snippets;

CREATE POLICY "Users can view snippets based on privacy settings"
  ON public.snippets FOR SELECT
  USING (
    -- Публичные сниппеты доступны всем
    is_private = false
    OR
    -- Приватные сниппеты доступны автору
    user_id = auth.uid()
    OR
    -- Приватные сниппеты доступны подписчикам автора
    (is_private = true AND EXISTS (
      SELECT 1 FROM public.user_follows uf
      WHERE uf.following_id = snippets.user_id
      AND uf.follower_id = auth.uid()
    ))
  );

-- Создаем storage bucket для файлов проектов
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false);

-- Создаем политики для storage bucket проектов
CREATE POLICY "Users can view project files if they have access to project"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files' 
    AND EXISTS (
      SELECT 1 FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      WHERE pf.file_url = storage.objects.name
      AND (
        -- Публичные проекты доступны всем
        p.is_private = false
        OR
        -- Приватные проекты доступны автору
        p.user_id = auth.uid()
        OR
        -- Приватные проекты доступны подписчикам автора
        (p.is_private = true AND EXISTS (
          SELECT 1 FROM public.user_follows uf
          WHERE uf.following_id = p.user_id
          AND uf.follower_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can upload files to their own projects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own project files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );