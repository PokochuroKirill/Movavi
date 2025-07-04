
-- Исправляем внешний ключ для комментариев сниппетов
ALTER TABLE public.snippet_comments DROP CONSTRAINT IF EXISTS fk_snippet_comments_user;
ALTER TABLE public.snippet_comments ADD CONSTRAINT fk_snippet_comments_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Исправляем внешний ключ для комментариев проектов  
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS fk_comments_user;
ALTER TABLE public.comments ADD CONSTRAINT fk_comments_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Исправляем каскадное удаление для связи сниппет-комментарии
ALTER TABLE public.snippet_comments DROP CONSTRAINT IF EXISTS fk_snippet_comments_snippet;
ALTER TABLE public.snippet_comments ADD CONSTRAINT fk_snippet_comments_snippet
FOREIGN KEY (snippet_id) REFERENCES public.snippets(id) ON DELETE CASCADE;

-- Исправляем каскадное удаление для связи проект-комментарии
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS fk_comments_project;
ALTER TABLE public.comments ADD CONSTRAINT fk_comments_project
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
