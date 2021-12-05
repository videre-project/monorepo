import { join } from 'path';
import { readdirSync, statSync } from 'fs';

export const API_DIR = join(__dirname, '..', 'api');

export const parseRoute = route =>
  route
    // Remove base path
    .replace(API_DIR, '')
    // Make path web-safe
    .replace(/\\/g, '/')
    // Remove file extension
    .replace(/\.[^.]+$/, '')
    // Handle dynamic route
    .replace(/\[([^\]]+)\]/, ':$1')
    // Handle route index
    .replace('/index', '/');

export const crawlRoutes = (path, routes = []) => {
  if (statSync(path).isDirectory()) {
    readdirSync(path).map(file => crawlRoutes(join(path, file), routes));
  } else if (path !== __filename && /\.js$/.test(path)) {
    routes.push(path);
  }

  return routes;
};