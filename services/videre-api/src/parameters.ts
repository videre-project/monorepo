/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { IRequest } from 'itty-router/Router';

import type { Context } from './handler';


/**
 * Default query parameter values.
 */
export const getDefault = (key: string) => (({
    /**
   * Defaults to 31 days ago
   */
    min_date: new Date(new Date().setDate(new Date().getDate() - 31)),
  /**
   * Defaults to today
   */
  max_date: new Date(),
  /**
   * Defaults to 100 results
   */
  limit: 100,
})[key]);

/**
 * A middleware that hoists request parameters and query args, adding any
 * parameter defaults if they don't exist.
 */
export const withParams = (req: IRequest, { params }: Context, ..._: any[]) => {
  req.proxy = new Proxy(req.proxy || req, {
    get: (obj, prop) => obj[prop] !== undefined
      ? obj[prop].bind?.(req) || obj[prop]
      : (
        params[prop as string] ??=
          obj?.params?.[prop] ??
          obj?.query?.[prop] ??
          getDefault(prop as string)
      ),
    set: (obj, prop, value) => {
      // Allow updating of parameters
      if (prop in params)
      {
        params[prop as string] = value;
        return true;
      }
      // Always set request properties
      obj[prop] = value;
      return true;
    }
  })
}

/**
 * A middleware that filters request parameters by the given list of parameters.
 * @param params The list of parameters to include.
 * @returns A middleware that filters the request parameters.
 */
export const useParams = (params: string[]) => {
  return ({ proxy }: IRequest, ctx: Context, ..._: any[]) => {
    ctx.params = new Proxy(ctx.params, {
      get: (obj, prop) => (
        obj[prop as string] ??= params.includes(prop as string)
          ? obj[prop as string] || proxy[prop as string]
          : undefined
      ),
      set: (obj, prop, value) =>
        params.includes(prop as string)
        ? obj[prop as string] = value
        : false,
    });
  }
}
