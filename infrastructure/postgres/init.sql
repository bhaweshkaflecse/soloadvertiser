-- Solo Advertiser — PostgreSQL Initialization Script
-- This script runs on first database creation.

-- Create the application database (if not using default)
-- CREATE DATABASE soloadvertiser;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas for domain separation
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS campaigns;
CREATE SCHEMA IF NOT EXISTS riders;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions
GRANT ALL ON SCHEMA auth TO CURRENT_USER;
GRANT ALL ON SCHEMA campaigns TO CURRENT_USER;
GRANT ALL ON SCHEMA riders TO CURRENT_USER;
GRANT ALL ON SCHEMA billing TO CURRENT_USER;
GRANT ALL ON SCHEMA analytics TO CURRENT_USER;
