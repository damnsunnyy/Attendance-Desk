CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN CREATE TYPE app_role AS ENUM ('SUPER_ADMIN','ADMIN','MANAGER','EMPLOYEE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE leave_status AS ENUM ('PENDING','L1_REVIEW','L2_REVIEW','APPROVED','REJECTED','CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE comp_status AS ENUM ('AVAILABLE','USED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), emp_code TEXT UNIQUE, name TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role app_role NOT NULL DEFAULT 'EMPLOYEE',
 department TEXT NOT NULL DEFAULT 'PM Core', joining_date DATE, l1_manager_id UUID REFERENCES users(id),
 l2_manager_id UUID REFERENCES users(id), is_active BOOLEAN NOT NULL DEFAULT TRUE,
 must_change_password BOOLEAN NOT NULL DEFAULT TRUE, refresh_token_hash TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (role <> 'EMPLOYEE' OR emp_code IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS users_department_idx ON users(department);
CREATE TABLE IF NOT EXISTS leave_types (
 id SERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, full_entitlement NUMERIC(6,2) NOT NULL DEFAULT 0,
 is_prorata BOOLEAN NOT NULL DEFAULT FALSE, fixed_for_new_joinees BOOLEAN NOT NULL DEFAULT FALSE, fixed_value NUMERIC(6,2) NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS leave_periods (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, starts_on DATE NOT NULL, ends_on DATE NOT NULL,
 status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','CLOSED')), UNIQUE(starts_on,ends_on), CHECK(ends_on >= starts_on)
);
CREATE TABLE IF NOT EXISTS leave_balances (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 leave_type_id INT NOT NULL REFERENCES leave_types(id), period_id UUID NOT NULL REFERENCES leave_periods(id),
 allocated NUMERIC(7,2) NOT NULL DEFAULT 0 CHECK(allocated>=0), used NUMERIC(7,2) NOT NULL DEFAULT 0 CHECK(used>=0),
 adjustment NUMERIC(7,2) NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(user_id,leave_type_id,period_id), CHECK(used <= allocated + adjustment)
);
CREATE TABLE IF NOT EXISTS holidays (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), holiday_date DATE NOT NULL UNIQUE, name TEXT NOT NULL,
 type TEXT NOT NULL CHECK(type IN ('national','optional')), year INT NOT NULL, created_by UUID REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leave_applications (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id), from_date DATE NOT NULL, to_date DATE NOT NULL,
 working_days NUMERIC(6,2) NOT NULL CHECK(working_days>0), leave_type_id INT REFERENCES leave_types(id), is_combined BOOLEAN NOT NULL DEFAULT FALSE,
 is_lwp BOOLEAN NOT NULL DEFAULT FALSE, reason TEXT NOT NULL CHECK(length(reason)>=10), status leave_status NOT NULL DEFAULT 'PENDING',
 l1_manager_id UUID REFERENCES users(id), l2_manager_id UUID REFERENCES users(id), l1_action_at TIMESTAMPTZ,
 l2_action_at TIMESTAMPTZ, l1_comment TEXT, l2_comment TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK(to_date>=from_date)
);
CREATE INDEX IF NOT EXISTS leave_applications_queue_idx ON leave_applications(status,created_at DESC);
CREATE INDEX IF NOT EXISTS leave_applications_user_idx ON leave_applications(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS combined_leave_details (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), application_id UUID NOT NULL REFERENCES leave_applications(id) ON DELETE CASCADE,
 leave_type_id INT NOT NULL REFERENCES leave_types(id), days_used NUMERIC(6,2) NOT NULL CHECK(days_used>0), UNIQUE(application_id,leave_type_id)
);
CREATE TABLE IF NOT EXISTS comp_off_logs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id), earned_date DATE NOT NULL,
 work_date DATE NOT NULL, granted_by UUID NOT NULL REFERENCES users(id), used_on_application_id UUID REFERENCES leave_applications(id),
 status comp_status NOT NULL DEFAULT 'AVAILABLE', notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id BIGSERIAL PRIMARY KEY, actor_id UUID REFERENCES users(id), action TEXT NOT NULL, target_table TEXT NOT NULL,
 target_id TEXT, details JSONB NOT NULL DEFAULT '{}'::jsonb, ip_address INET, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);
CREATE TABLE IF NOT EXISTS notifications (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title TEXT NOT NULL, body TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'INFO', read_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());
INSERT INTO leave_types(code,name,full_entitlement,is_prorata,fixed_for_new_joinees,fixed_value) VALUES
 ('CL','Casual Leave',7,TRUE,FALSE,0),('SL','Sick Leave',1,FALSE,TRUE,1),('CO','Compensatory Off',0,FALSE,FALSE,0)
ON CONFLICT(code) DO NOTHING;
INSERT INTO leave_periods(name,starts_on,ends_on) VALUES ('PM Core 2026 · Jan–Jul','2026-01-01','2026-07-31') ON CONFLICT(starts_on,ends_on) DO NOTHING;
