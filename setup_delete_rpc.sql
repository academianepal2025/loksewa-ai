-- Function to safely delete a user's data from all public tables
-- This ensures no foreign key constraint errors occur when deleting the auth.users row
CREATE OR REPLACE FUNCTION delete_user_all_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 1. Delete user-generated content and their sub-items
  DELETE FROM chat_messages WHERE user_id = p_user_id;
  DELETE FROM study_notes WHERE user_id = p_user_id;
  DELETE FROM study_plans WHERE user_id = p_user_id;
  DELETE FROM quiz_attempts WHERE user_id = p_user_id;
  DELETE FROM flashcards WHERE user_id = p_user_id;
  DELETE FROM weekly_feedback WHERE user_id = p_user_id;
  DELETE FROM study_progress WHERE user_id = p_user_id;
  DELETE FROM mock_test_submissions WHERE user_id = p_user_id;
  DELETE FROM syllabus_analysis WHERE user_id = p_user_id;
  DELETE FROM user_exams WHERE user_id = p_user_id;
  
  -- 1a. Delete document chunks before documents
  DELETE FROM document_chunks WHERE document_id IN (SELECT id FROM documents WHERE user_id = p_user_id);
  DELETE FROM documents WHERE user_id = p_user_id;
  
  -- 2. Delete analytics and logs
  DELETE FROM activity_logs WHERE user_id = p_user_id;
  DELETE FROM ai_usage_logs WHERE user_id = p_user_id;
  
  -- 3. Delete billing, subscriptions, and usage limits
  DELETE FROM subscriptions WHERE user_id = p_user_id;
  DELETE FROM daily_usage WHERE user_id = p_user_id;
  DELETE FROM payment_requests WHERE user_id = p_user_id;
  
  -- 4. Delete user settings
  DELETE FROM user_preferences WHERE user_id = p_user_id;
  
  -- 5. Finally, delete the public profile
  DELETE FROM profiles WHERE id = p_user_id;
  
  -- Note: The actual auth.users row is deleted by the Admin API in the Next.js route
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
