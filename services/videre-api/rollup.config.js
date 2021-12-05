import { join } from 'path';
import { mkdirSync, copyFileSync, statSync, readdirSync } from 'fs';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const API_DIR = join(process.cwd(), 'src/api');
const BUILD_DIR = join(process.cwd(), 'api');

// Copy package.json to build dir
mkdirSync(BUILD_DIR);
copyFileSync(join(process.cwd(), 'package.json'), join(BUILD_DIR, 'package.json'));

const crawlRoutes = (path, routes = []) => {
  if (statSync(path).isDirectory()) {
    readdirSync(path).map(file => crawlRoutes(join(path, file), routes));
  } else if (path !== __filename) {
    routes.push(path);
  }

  return routes;
};

const config = crawlRoutes(API_DIR).map(path => ({
  input: path,
  output: {
    file: path.replace(API_DIR, BUILD_DIR),
    format: 'cjs',
    plugins: [resolve(), babel()],
    exports: 'auto',
  },
}));

export default config;
