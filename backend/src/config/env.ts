import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crowdfunding_db',
  JWT_SECRET: process.env.JWT_SECRET || 'secreto_super_seguro',
  NODE_ENV: process.env.NODE_ENV || 'development'
};