-- HeartGuard AI Database Migration
-- 002_add_patient_optional_profile_fields.sql
-- Description: Adds optional medical and demographic fields to patients table.

ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
    ADD COLUMN IF NOT EXISTS height DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS weight DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS medical_conditions VARCHAR(500),
    ADD COLUMN IF NOT EXISTS allergies VARCHAR(500),
    ADD COLUMN IF NOT EXISTS medications VARCHAR(500),
    ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS address VARCHAR(255);
