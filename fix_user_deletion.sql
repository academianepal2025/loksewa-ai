-- This script updates foreign key constraints to allow deleting users from auth.users
-- by automatically cascading the deletion to all related public tables.

-- 1. Profiles
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Subscriptions
ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey,
  ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Documents
ALTER TABLE public.documents 
  DROP CONSTRAINT IF EXISTS documents_user_id_fkey,
  ADD CONSTRAINT documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Chat Messages
ALTER TABLE public.chat_messages 
  DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey,
  ADD CONSTRAINT chat_messages_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Quiz Attempts
ALTER TABLE public.quiz_attempts 
  DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_fkey,
  ADD CONSTRAINT quiz_attempts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Study Notes
ALTER TABLE public.study_notes 
  DROP CONSTRAINT IF EXISTS study_notes_user_id_fkey,
  ADD CONSTRAINT study_notes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Study Plans
ALTER TABLE public.study_plans 
  DROP CONSTRAINT IF EXISTS study_plans_user_id_fkey,
  ADD CONSTRAINT study_plans_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 8. Activity Logs
ALTER TABLE public.activity_logs 
  DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey,
  ADD CONSTRAINT activity_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 9. AI Usage Logs
ALTER TABLE public.ai_usage_logs 
  DROP CONSTRAINT IF EXISTS ai_usage_logs_user_id_fkey,
  ADD CONSTRAINT ai_usage_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 10. Daily Usage
ALTER TABLE public.daily_usage 
  DROP CONSTRAINT IF EXISTS daily_usage_user_id_fkey,
  ADD CONSTRAINT daily_usage_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 11. Payment Requests
ALTER TABLE public.payment_requests 
  DROP CONSTRAINT IF EXISTS payment_requests_user_id_fkey,
  ADD CONSTRAINT payment_requests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 12. User Preferences
ALTER TABLE public.user_preferences 
  DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey,
  ADD CONSTRAINT user_preferences_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 13. User Exams
ALTER TABLE public.user_exams 
  DROP CONSTRAINT IF EXISTS user_exams_user_id_fkey,
  ADD CONSTRAINT user_exams_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 14. Study Progress
ALTER TABLE public.study_progress 
  DROP CONSTRAINT IF EXISTS study_progress_user_id_fkey,
  ADD CONSTRAINT study_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 15. Flashcards
ALTER TABLE public.flashcards 
  DROP CONSTRAINT IF EXISTS flashcards_user_id_fkey,
  ADD CONSTRAINT flashcards_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 16. Weekly Feedback
ALTER TABLE public.weekly_feedback 
  DROP CONSTRAINT IF EXISTS weekly_feedback_user_id_fkey,
  ADD CONSTRAINT weekly_feedback_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 17. Syllabus Analysis
ALTER TABLE public.syllabus_analysis 
  DROP CONSTRAINT IF EXISTS syllabus_analysis_user_id_fkey,
  ADD CONSTRAINT syllabus_analysis_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 18. Mock Test Submissions
ALTER TABLE public.mock_test_submissions 
  DROP CONSTRAINT IF EXISTS mock_test_submissions_user_id_fkey,
  ADD CONSTRAINT mock_test_submissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- CHILD TABLES (Cascading from other public tables)

-- 19. Document Chunks (CASCADES FROM documents)
ALTER TABLE public.document_chunks 
  DROP CONSTRAINT IF EXISTS document_chunks_document_id_fkey,
  ADD CONSTRAINT document_chunks_document_id_fkey 
    FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;
