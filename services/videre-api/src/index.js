import dotenv from 'dotenv';
import chalk from 'chalk';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { morganMiddleware } from './utils/morgan';
import { API_DIR, parseRoute, crawlRoutes } from './utils/routes';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Server config.
const server = express();
server.use(cors());
server.use(helmet());
server.use(express.json());
server.use(morganMiddleware);

// API methods.
crawlRoutes(API_DIR).forEach(route => {
  server.all(parseRoute(route), require(route).default);
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, error => {
    if (error) {
      console.error(
        chalk.hex('#61AFFE')('[Server]') +
          chalk.grey('\n>> ') +
          chalk.red(`Error: ${error.stack}`)
      );
    }

    // Clear console
    process.stdout.write('\x1Bc');
    console.info(
      chalk.cyan('[Server]'),
      chalk.hex('#7E7E89')(`Listening on port ${PORT}`)
    );
  });
}

export default server;
