-- Create activity_logs table for DAU/MAU
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(user_id, activity_date)
);

-- Create ai_usage_logs table for tracking Gemini usage and feature popularity
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- 'chat', 'quiz', 'notes', 'plan'
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    cost_estimate NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_metrics table for admin panel pre-aggregated data
CREATE TABLE IF NOT EXISTS daily_metrics (
    day DATE PRIMARY KEY,
    signups INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    pro_conversions INTEGER DEFAULT 0,
    total_ai_cost NUMERIC DEFAULT 0,
    meta JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own activity" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own activity" ON activity_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage" ON ai_usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own AI usage" ON ai_usage_logs FOR SELECT USING (auth.uid() = user_id);

-- Only admins can view all logs and metrics (handled via service_role key in API, or you can add admin policies here)
