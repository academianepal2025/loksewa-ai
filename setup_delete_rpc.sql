-- Function to safely delete a user's data from all public tables
-- This ensures no foreign key constraint errors occur when deleting the auth.users row
CREATE OR REPLACE FUNCTION delete_user_all_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 1. Delete all user-generated content
  DELETE FROM chat_messages WHERE user_id = p_user_id;
  DELETE FROM study_notes WHERE user_id = p_user_id;
  DELETE FROM study_plans WHERE user_id = p_user_id;
  DELETE FROM quiz_attempts WHERE user_id = p_user_id;
  DELETE FROM documents WHERE user_id = p_user_id;
  
  -- 2. Delete analytics and logs
  DELETE FROM activity_logs WHERE user_id = p_user_id;
  DELETE FROM ai_usage_logs WHERE user_id = p_user_id;
  
  -- 3. Delete billing and subscriptions
  DELETE FROM subscriptions WHERE user_id = p_user_id;
  
  -- 4. Finally, delete the public profile
  -- (Assuming 'profiles' table exists. If your table is named differently, update it here)
  DELETE FROM profiles WHERE id = p_user_id;
  
  -- Note: The actual auth.users row is deleted by the Admin API in the Next.js route
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
