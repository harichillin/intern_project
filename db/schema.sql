-- NexaCore Sentinel AI: Database Schema
-- Location: db/schema.sql

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist for clean initialization
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS customers;

-- Segment Type
CREATE TYPE customer_segment AS ENUM ('Champions', 'Loyal', 'Potential', 'Dormant', 'At Risk');

-- 1. Customers Table
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    city VARCHAR(100) NOT NULL,
    account_balance DECIMAL(15, 2) DEFAULT 0.00,
    credit_score INTEGER CHECK (credit_score BETWEEN 300 AND 850),
    monthly_transactions INTEGER DEFAULT 0,
    login_frequency INTEGER DEFAULT 0, -- Times per month
    support_ticket_count INTEGER DEFAULT 0,
    last_login_days INTEGER DEFAULT 0,
    churn_probability DECIMAL(5, 4) DEFAULT 0.0000,
    fraud_score DECIMAL(5, 4) DEFAULT 0.0000,
    segment customer_segment DEFAULT 'Potential',
    relationship_health_score INTEGER CHECK (relationship_health_score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('debit', 'credit')),
    merchant VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Support Tickets Table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
    issue TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
    risk_score DECIMAL(5, 4) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Large Transaction', 'Velocity Spike', 'Location Mismatch')),
    status VARCHAR(20) CHECK (status IN ('open', 'resolved', 'dismissed')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_customer_segment ON customers(segment);
CREATE INDEX idx_transaction_customer ON transactions(customer_id);
CREATE INDEX idx_alert_customer ON alerts(customer_id);
CREATE INDEX idx_ticket_customer ON support_tickets(customer_id);
