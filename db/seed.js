/**
 * NexaCore Sentinel AI: Database Seeder
 * Location: db/seed.js
 * 
 * Generates 1,000 customers, 10,000 transactions, 500 support tickets, and 200 alerts.
 * Uses @faker-js/faker for realistic data generation.
 */

const { Client } = require('pg');
const { faker } = require('@faker-js/faker');

// Configuration - adjust as per your local PostgreSQL setup
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexacore_db';

const client = new Client({
    connectionString: connectionString
});

async function seedDatabase() {
    try {
        console.log('Connecting to PostgreSQL...');
        await client.connect();
        console.log('Connected successfully.');

        // 1. Clear existing data (optional but recommended for clean seed)
        console.log('Clearing old data...');
        await client.query('TRUNCATE alerts, support_tickets, transactions, customers CASCADE;');

        const customerIds = [];
        const segments = ['Champions', 'Loyal', 'Potential', 'Dormant', 'At Risk'];
        const transactionTypes = ['debit', 'credit'];
        const alertTypes = ['Large Transaction', 'Velocity Spike', 'Location Mismatch'];
        const ticketStatuses = ['open', 'resolved'];
        const alertStatuses = ['open', 'resolved', 'dismissed'];

        // 2. Seed 1,000 Customers
        console.log('Seeding 1,000 Customers...');
        for (let i = 0; i < 1000; i++) {
            const name = faker.person.fullName();
            const age = faker.number.int({ min: 18, max: 80 });
            const city = faker.location.city();
            const balance = faker.number.float({ min: 1000, max: 1000000, fractionDigits: 2 });
            const creditScore = faker.number.int({ min: 300, max: 850 });
            const monthlyTransactions = faker.number.int({ min: 0, max: 50 });
            const loginFrequency = faker.number.int({ min: 0, max: 30 });
            const supportTicketCount = faker.number.int({ min: 0, max: 5 });
            const lastLoginDays = faker.number.int({ min: 0, max: 180 });
            const churnProb = faker.number.float({ min: 0, max: 1, fractionDigits: 4 });
            const fraudScore = faker.number.float({ min: 0, max: 1, fractionDigits: 4 });
            const segment = faker.helpers.arrayElement(segments);
            const healthScore = faker.number.int({ min: 20, max: 100 });

            const res = await client.query(
                `INSERT INTO customers (name, age, city, account_balance, credit_score, monthly_transactions, login_frequency, support_ticket_count, last_login_days, churn_probability, fraud_score, segment, relationship_health_score) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING customer_id`,
                [name, age, city, balance, creditScore, monthlyTransactions, loginFrequency, supportTicketCount, lastLoginDays, churnProb, fraudScore, segment, healthScore]
            );
            customerIds.push(res.rows[0].customer_id);
        }
        console.log('Customers seeded.');

        // 3. Seed 10,000 Transactions
        console.log('Seeding 10,000 Transactions...');
        for (let i = 0; i < 10000; i++) {
            const customer_id = faker.helpers.arrayElement(customerIds);
            const amount = faker.number.float({ min: 10, max: 50000, fractionDigits: 2 });
            const type = faker.helpers.arrayElement(transactionTypes);
            const merchant = faker.company.name();
            const timestamp = faker.date.recent({ days: 90 });

            await client.query(
                `INSERT INTO transactions (customer_id, amount, type, merchant, timestamp) VALUES ($1, $2, $3, $4, $5)`,
                [customer_id, amount, type, merchant, timestamp]
            );
        }
        console.log('Transactions seeded.');

        // 4. Seed 500 Support Tickets
        console.log('Seeding 500 Support Tickets...');
        for (let i = 0; i < 500; i++) {
            const customer_id = faker.helpers.arrayElement(customerIds);
            const issue = faker.hacker.phrase() + ' related to ' + faker.commerce.productName();
            const status = faker.helpers.arrayElement(ticketStatuses);
            const createdAt = faker.date.recent({ days: 30 });

            await client.query(
                `INSERT INTO support_tickets (customer_id, issue, status, created_at) VALUES ($1, $2, $3, $4)`,
                [customer_id, issue, status, createdAt]
            );
        }
        console.log('Support tickets seeded.');

        // 5. Seed 200 Security Alerts
        console.log('Seeding 200 Security Alerts...');
        for (let i = 0; i < 200; i++) {
            const customer_id = faker.helpers.arrayElement(customerIds);
            const risk_score = faker.number.float({ min: 0.5, max: 0.99, fractionDigits: 4 });
            const type = faker.helpers.arrayElement(alertTypes);
            const status = faker.helpers.arrayElement(alertStatuses);
            const createdAt = faker.date.recent({ days: 15 });

            await client.query(
                `INSERT INTO alerts (customer_id, risk_score, type, status, created_at) VALUES ($1, $2, $3, $4, $5)`,
                [customer_id, risk_score, type, status, createdAt]
            );
        }
        console.log('Security alerts seeded.');

        console.log('Database Seeding Completed Successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await client.end();
        console.log('PostgreSQL connection closed.');
    }
}

seedDatabase();
