
-- Verify the user with email lattedeveloper@inbox.ru
UPDATE profiles
SET is_verified = true
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'lattedeveloper@inbox.ru'
);
