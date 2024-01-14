/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { Context } from "./handler";


/**
 * The default cache policy used by the Cloudflare CDN.
 * - Browser cache: 1 hour
 * - CDN cache: 30 minutes
 */
export const CACHE_POLICY = `max-age=3600, s-maxage=1800`;

/**
 * Represents a handler for caching operations.
 */
export class CacheHandler {
  /**
   * Creates a new instance of the CacheHandler class.
   * @param cache The cache instance to use.
   * @param key The key associated with the cache entry.
   */
  constructor(private cache: Cache, private key: RequestInfo) {}

  /**
   * Deletes the cache entry associated with the specified key.
   * @param options The options for the cache query.
   * @returns A promise that resolves to true if the cache entry was successfully deleted, or false otherwise.
   */
  public async delete(options?: CacheQueryOptions): Promise<boolean> {
    return this.cache.delete(this.key, options);
  }

  /**
   * Retrieves the cache entry associated with the specified key.
   * @param options The options for the cache query.
   * @returns A promise that resolves to the response if a matching cache entry is found, or undefined otherwise.
   */
  public async match(options?: CacheQueryOptions): Promise<Response | undefined> {
    return this.cache.match(this.key, options);
  }

  /**
   * Adds or updates a cache entry with the specified response.
   * @param response The response to be stored in the cache.
   * @returns A promise that resolves when the cache entry is successfully added or updated.
   */
  public async put(response: Response): Promise<void> {
    return this.cache.put(this.key, response);
  }
}

/**
 * Middleware for retrieving cached responses.
 */
export const useCache = async (req: Request, ctx: Context) => {
  // Check if the request is already cached.
  const cache = new CacheHandler(caches.default, new Request(req.url, req));
  const res = await cache.match();
  if (res) return res;

  // Provide the cache handler if the request is not cached.
  ctx.cache = cache;
}

/**
 * Updates the Cloudflare CDN cache with the response.
 * @param res The response to be cached.
 * @param ctx The request context.
 */
export const updateCache = (res: Response, { cf, cache }: Context) => {
  // Skip caching if the response is an error.
  if (res.status >= 400) return res;

  // Try to cache the response using the Cloudflare CDN.
  if (cache && res.headers.get('CF-Cache-Status') !== 'HIT') {
    res.headers.set('Cache-Control', CACHE_POLICY);
    cf.waitUntil(cache.put(res.clone()));
  }

  return res;
}
