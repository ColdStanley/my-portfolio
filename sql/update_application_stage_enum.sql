-- Update application_stage_enum to include JD2CV workflow stages
-- This script adds the new enum values needed for the JD2CV workflow

-- First, check if the enum exists and what values it currently has
DO $$
DECLARE
    enum_exists BOOLEAN;
    current_values TEXT[];
BEGIN
    -- Check if enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'application_stage_enum'
    ) INTO enum_exists;
    
    IF enum_exists THEN
        -- Get current enum values
        SELECT array_agg(enumlabel ORDER BY enumsortorder) 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'application_stage_enum'
        INTO current_values;
        
        RAISE NOTICE 'Current enum values: %', current_values;
    ELSE
        RAISE NOTICE 'application_stage_enum does not exist yet';
    END IF;
END $$;

-- Create the enum if it doesn't exist, or add missing values if it does
DO $$
DECLARE
    enum_exists BOOLEAN;
BEGIN
    -- Check if enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'application_stage_enum'
    ) INTO enum_exists;
    
    IF NOT enum_exists THEN
        -- Create enum with all required values
        CREATE TYPE application_stage_enum AS ENUM (
            'Raw JD',
            'Key Words', 
            'CV Contents',
            'CV Layout',
            'Applied',
            'Interview',
            'Assessment',
            'Offer',
            'Rejected',
            'Withdrawn'
        );
        RAISE NOTICE 'Created application_stage_enum with all values';
    ELSE
        -- Add missing values to existing enum
        -- Check and add each value if it doesn't exist
        
        -- Raw JD
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Raw JD') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Raw JD';
            RAISE NOTICE 'Added: Raw JD';
        END IF;
        
        -- Key Words
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Key Words') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Key Words';
            RAISE NOTICE 'Added: Key Words';
        END IF;
        
        -- CV Contents
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'CV Contents') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'CV Contents';
            RAISE NOTICE 'Added: CV Contents';
        END IF;
        
        -- CV Layout
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'CV Layout') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'CV Layout';
            RAISE NOTICE 'Added: CV Layout';
        END IF;
        
        -- Applied (might already exist)
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Applied') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Applied';
            RAISE NOTICE 'Added: Applied';
        END IF;
        
        -- Interview (might already exist)
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Interview') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Interview';
            RAISE NOTICE 'Added: Interview';
        END IF;
        
        -- Assessment
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Assessment') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Assessment';
            RAISE NOTICE 'Added: Assessment';
        END IF;
        
        -- Offer (might already exist)
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Offer') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Offer';
            RAISE NOTICE 'Added: Offer';
        END IF;
        
        -- Rejected (might already exist)
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Rejected') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Rejected';
            RAISE NOTICE 'Added: Rejected';
        END IF;
        
        -- Withdrawn
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
                       WHERE t.typname = 'application_stage_enum' AND e.enumlabel = 'Withdrawn') THEN
            ALTER TYPE application_stage_enum ADD VALUE 'Withdrawn';
            RAISE NOTICE 'Added: Withdrawn';
        END IF;
    END IF;
END $$;

-- Verify the final enum values
DO $$
DECLARE
    final_values TEXT[];
BEGIN
    SELECT array_agg(enumlabel ORDER BY enumsortorder) 
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'application_stage_enum'
    INTO final_values;
    
    RAISE NOTICE 'Final enum values: %', final_values;
    RAISE NOTICE 'application_stage_enum update completed successfully!';
END $$;

-- Create jd_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS jd_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Core fields
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    full_job_description TEXT,
    
    -- Analysis results
    jd_key_sentences TEXT,
    keywords_from_sentences TEXT,
    match_score NUMERIC(2,1) DEFAULT 3.0 CHECK (match_score >= 0 AND match_score <= 5),
    
    -- Classification tags
    application_stage application_stage_enum,
    role_group TEXT,
    firm_type TEXT,
    comment TEXT,
    
    -- CV related
    cv_pdf_url TEXT,
    cv_pdf_filename TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jd_records_user_id ON jd_records(user_id);
CREATE INDEX IF NOT EXISTS idx_jd_records_application_stage ON jd_records(application_stage);
CREATE INDEX IF NOT EXISTS idx_jd_records_created_at ON jd_records(created_at);

-- Enable RLS
ALTER TABLE jd_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage their own JD records" ON jd_records;
CREATE POLICY "Users can manage their own JD records" ON jd_records
    FOR ALL USING (auth.uid() = user_id);

-- Verify table structure
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'jd_records' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ jd_records table exists and is ready';
    ELSE
        RAISE NOTICE '❌ jd_records table was not created successfully';
    END IF;
END $$;