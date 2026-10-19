DO $$ BEGIN CREATE TYPE attendance_state AS ENUM ('PRESENT','LATE','HALF_DAY','ABSENT','HOLIDAY','WEEKLY_OFF'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS attendance_records (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 work_date DATE NOT NULL, check_in_at TIMESTAMPTZ, check_out_at TIMESTAMPTZ,
 status attendance_state NOT NULL DEFAULT 'PRESENT', source TEXT NOT NULL DEFAULT 'WEB', notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(user_id,work_date), CHECK(check_out_at IS NULL OR check_in_at IS NOT NULL),
 CHECK(check_out_at IS NULL OR check_out_at >= check_in_at)
);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance_records(work_date,status);
CREATE INDEX IF NOT EXISTS attendance_user_date_idx ON attendance_records(user_id,work_date DESC);
CREATE TABLE IF NOT EXISTS attendance_corrections (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), attendance_id UUID REFERENCES attendance_records(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES users(id), work_date DATE NOT NULL, requested_check_in TIMESTAMPTZ,
 requested_check_out TIMESTAMPTZ, reason TEXT NOT NULL CHECK(length(reason)>=10),
 status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')),
 reviewed_by UUID REFERENCES users(id), reviewer_comment TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS attendance_corrections_queue_idx ON attendance_corrections(status,created_at DESC);
