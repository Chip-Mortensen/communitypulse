-- Delete operations for CommunityPulse database
-- This script clears existing data to prepare for fresh seed data

-- Enable error handling
\set ON_ERROR_STOP on

BEGIN;

-- 1. CLEAR EXISTING DATA
-- ----------------------
-- Delete all data from tables with cascading deletes
-- This ensures we start with a clean slate

-- First, delete all upvotes
DELETE FROM upvotes;

-- Delete all issues (will cascade to related comments and upvotes)
DELETE FROM issues;

-- Reset the categories to default values
DELETE FROM categories;
INSERT INTO categories (name, color, icon) VALUES
  ('Infrastructure', '#3B82F6', 'road'),
  ('Safety', '#EF4444', 'shield-exclamation'),
  ('Environment', '#10B981', 'tree'),
  ('Public Services', '#F59E0B', 'office-building'),
  ('Other', '#6B7280', 'dots-horizontal');

-- Delete only our seed profiles by their specific UUIDs
DELETE FROM profiles 
WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000012',
  '10000000-0000-0000-0000-000000000013',
  '10000000-0000-0000-0000-000000000014',
  '10000000-0000-0000-0000-000000000015'
);

COMMIT; 