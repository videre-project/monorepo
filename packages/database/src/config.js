import dotenv from 'dotenv';

dotenv.config();

const config = {
  connectionString:
    process.env.DATABASE_URL || 'postgresql://postgres:videre@127.0.0.1:5432/postgres',
  proxyURL:
    process.env.PROXY_URL
};

export default config;