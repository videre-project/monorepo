import dotenv from 'dotenv';

dotenv.config();

const config = {
  EDGEDB_DSN: process.env.EDGEDB_DSN
  // "edgedb://USERNAME:PASSWORD@HOSTNAME:PORT/DATABASE"
};

export default config;