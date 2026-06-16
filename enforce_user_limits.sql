-- PostgreSQL Triggers to Enforce Free Tier Limits at the Database Layer

CREATE OR REPLACE FUNCTION enforce_free_tier_limits()
RETURNS TRIGGER AS $$
DECLARE
    v_is_pro BOOLEAN;
    v_is_admin BOOLEAN;
    v_count INTEGER;
BEGIN
    -- 1. Check if user is admin
    SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = NEW.user_id;
    IF v_is_admin THEN
        RETURN NEW;
    END IF;

    -- 2. Check if user has active pro subscription
    SELECT EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE user_id = NEW.user_id 
          AND plan <> 'free' 
          AND status = 'active' 
          AND expires_at > NOW()
    ) INTO v_is_pro;

    IF v_is_pro THEN
        RETURN NEW;
    END IF;

    -- 3. Enforce table-specific limits for free users
    IF TG_TABLE_NAME = 'documents' THEN
        SELECT COUNT(*) INTO v_count FROM public.documents WHERE user_id = NEW.user_id;
        IF v_count >= 3 THEN
            RAISE EXCEPTION 'Storage Limit Reached. Free plan is limited to 3 documents. Please upgrade to Pro.';
        END IF;
    ELSIF TG_TABLE_NAME = 'user_exams' THEN
        SELECT COUNT(*) INTO v_count FROM public.user_exams WHERE user_id = NEW.user_id;
        IF v_count >= 1 THEN
            RAISE EXCEPTION 'Exam Limit Reached. Free plan is limited to 1 exam. Please upgrade to Pro.';
        END IF;
    ELSIF TG_TABLE_NAME = 'study_notes' THEN
        SELECT COUNT(*) INTO v_count FROM public.study_notes WHERE user_id = NEW.user_id AND generation_status = 'ready';
        IF v_count >= 3 THEN
            RAISE EXCEPTION 'Notes Limit Reached. Free plan is limited to 3 study notes. Please upgrade to Pro.';
        END IF;
    ELSIF TG_TABLE_NAME = 'mock_test_submissions' THEN
        RAISE EXCEPTION 'Mock tests and evaluations are premium features. Please upgrade to Pro.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for documents
DROP TRIGGER IF EXISTS trg_enforce_documents_limit ON public.documents;
CREATE TRIGGER trg_enforce_documents_limit
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION enforce_free_tier_limits();

-- Trigger for user_exams
DROP TRIGGER IF EXISTS trg_enforce_user_exams_limit ON public.user_exams;
CREATE TRIGGER trg_enforce_user_exams_limit
BEFORE INSERT ON public.user_exams
FOR EACH ROW
EXECUTE FUNCTION enforce_free_tier_limits();

-- Trigger for study_notes
DROP TRIGGER IF EXISTS trg_enforce_study_notes_limit ON public.study_notes;
CREATE TRIGGER trg_enforce_study_notes_limit
BEFORE INSERT ON public.study_notes
FOR EACH ROW
EXECUTE FUNCTION enforce_free_tier_limits();

-- Trigger for mock_test_submissions
DROP TRIGGER IF EXISTS trg_enforce_mock_test_submissions_limit ON public.mock_test_submissions;
CREATE TRIGGER trg_enforce_mock_test_submissions_limit
BEFORE INSERT ON public.mock_test_submissions
FOR EACH ROW
EXECUTE FUNCTION enforce_free_tier_limits();


-- Trigger for daily usage (chat and quiz daily limit check)
CREATE OR REPLACE FUNCTION enforce_daily_usage_limits()
RETURNS TRIGGER AS $$
DECLARE
    v_is_pro BOOLEAN;
    v_is_admin BOOLEAN;
BEGIN
    -- 1. Check if user is admin
    SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = NEW.user_id;
    IF v_is_admin THEN
        RETURN NEW;
    END IF;

    -- 2. Check if user has active pro subscription
    SELECT EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE user_id = NEW.user_id 
          AND plan <> 'free' 
          AND status = 'active' 
          AND expires_at > NOW()
    ) INTO v_is_pro;

    -- 3. Enforce limits
    IF v_is_pro THEN
        -- Pro user daily limits:
        -- Chat messages: 10
        IF NEW.chat_messages_sent > 10 THEN
            RAISE EXCEPTION 'Daily chat message limit reached for Pro users. Please try again tomorrow.';
        END IF;
        -- Notes generated: 5
        IF NEW.notes_generated > 5 THEN
            RAISE EXCEPTION 'Daily note generation limit reached for Pro users. Please try again tomorrow.';
        END IF;
    ELSE
        -- Free user daily limits:
        -- Chat messages: 3
        IF NEW.chat_messages_sent > 3 THEN
            RAISE EXCEPTION 'Daily chat message limit reached. Please upgrade to Pro.';
        END IF;
        -- Quizzes generated: 3
        IF NEW.quizzes_generated > 3 THEN
            RAISE EXCEPTION 'Daily quiz generation limit reached. Please upgrade to Pro.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_daily_usage_limits ON public.daily_usage;
CREATE TRIGGER trg_enforce_daily_usage_limits
BEFORE INSERT OR UPDATE ON public.daily_usage
FOR EACH ROW
EXECUTE FUNCTION enforce_daily_usage_limits();
