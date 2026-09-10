-- 1. Add referral_code to public.profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 2. Function to generate a random uppercase referral code (e.g. LOK-A8B9)
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := 'LOK-';
    i INTEGER;
    code_exists BOOLEAN := true;
BEGIN
    WHILE code_exists LOOP
        result := 'LOK-';
        FOR i IN 1..4 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END FOR;
        SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = result) INTO code_exists;
    END WHILE;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Create public.referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT DEFAULT 'signed_up' NOT NULL, -- 'signed_up', 'upgraded', 'rewarded'
    discount_applied NUMERIC DEFAULT 0,
    reward_days_granted INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_referee UNIQUE (referee_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals as referrer or referee" ON public.referrals;
CREATE POLICY "Users can view own referrals as referrer or referee"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- 4. Updated handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_ref_code TEXT;
    v_referrer_id UUID;
    v_new_code TEXT;
BEGIN
    -- Generate unique referral code for the new user
    v_new_code := generate_unique_referral_code();

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, full_name, email, phone, photo_url, is_admin, referral_code)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'No Name'),
        new.email,
        COALESCE(new.phone, new.raw_user_meta_data->>'phone_number', new.raw_user_meta_data->>'phone'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'photo_url', new.raw_user_meta_data->>'picture', null),
        false,
        v_new_code
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
        photo_url = COALESCE(public.profiles.photo_url, EXCLUDED.photo_url),
        referral_code = COALESCE(public.profiles.referral_code, EXCLUDED.referral_code);

    -- Check if a referral code was passed in metadata
    v_ref_code := UPPER(TRIM(COALESCE(new.raw_user_meta_data->>'referral_code', new.raw_user_meta_data->>'ref', '')));
    
    IF v_ref_code IS NOT NULL AND v_ref_code <> '' THEN
        SELECT id INTO v_referrer_id FROM public.profiles WHERE UPPER(referral_code) = v_ref_code;
        
        -- Make sure user didn't refer themselves
        IF v_referrer_id IS NOT NULL AND v_referrer_id <> new.id THEN
            INSERT INTO public.referrals (referrer_id, referee_id, referral_code, status)
            VALUES (v_referrer_id, new.id, v_ref_code, 'signed_up')
            ON CONFLICT (referee_id) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Ensure trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper function to award referral bonus (+7 days to referrer)
CREATE OR REPLACE FUNCTION public.award_referral_bonus(p_referee_id UUID)
RETURNS VOID AS $$
DECLARE
    v_referrer_id UUID;
    v_current_expiry TIMESTAMP WITH TIME ZONE;
    v_new_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT referrer_id INTO v_referrer_id FROM public.referrals WHERE referee_id = p_referee_id AND status = 'signed_up';
    
    IF v_referrer_id IS NOT NULL THEN
        -- Get referrer's current subscription expiry
        SELECT expires_at INTO v_current_expiry FROM public.subscriptions WHERE user_id = v_referrer_id AND status = 'active';
        
        IF v_current_expiry IS NOT NULL AND v_current_expiry > NOW() THEN
            v_new_expiry := v_current_expiry + INTERVAL '7 days';
        ELSE
            v_new_expiry := NOW() + INTERVAL '7 days';
        END IF;

        -- Upsert referrer's subscription
        INSERT INTO public.subscriptions (user_id, plan, status, expires_at)
        VALUES (v_referrer_id, 'pro_monthly', 'active', v_new_expiry)
        ON CONFLICT (user_id) DO UPDATE SET
            status = 'active',
            expires_at = EXCLUDED.expires_at,
            updated_at = NOW();

        -- Update referral status to rewarded
        UPDATE public.referrals
        SET status = 'rewarded'
        WHERE referee_id = p_referee_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
