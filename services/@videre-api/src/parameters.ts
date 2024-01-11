/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import type { IRequest } from 'itty-router/Router';

import type { Context } from './handler';


/**
 * Default query parameter values.
 */
export const DEFAULTS: { [key: string]: any } = {
  /**
   * Defaults to 3 weeks ago
   */
  min_date: new Date(new Date().setDate(new Date().getDate() - (7 * 3))),
  /**
   * Defaults to today
   */
  max_date: new Date(),
  /**
   * Defaults to 100 results
   */
  limit: 100,
}

/**
 * A proxy object wrapping the request returned from the withParams middleware.
 */
export type IProxy = IRequest;

/**
 * A middleware that hoists request parameters and query args, adding any
 * parameter defaults if they don't exist.
 */
export const withParams = (req: IRequest, { params }: Context, ..._: any[]) => {
  req.proxy = new Proxy(req.proxy || req, {
    get: (obj, prop) => obj[prop] !== undefined
      ? obj[prop].bind?.(req) || obj[prop]
      : ((prop: string) => {
        params[prop] ??=
          obj?.params?.[prop] ??
          obj?.query?.[prop] ??
          DEFAULTS?.[prop];
        return params[prop];
      })(prop as string),
  })
}

/**
 * A middleware that filters request parameters by the given list of parameters.
 * @param params The list of parameters to include.
 * @returns A middleware that filters the request parameters.
 */
export const useParams = (params: string[]) => {
  return (req: Request, ctx: Context, ..._: any[]) => {
    ctx.params = new Proxy(ctx.params, {
      get: (obj, prop) =>
        params.includes(prop as string)
          ? obj[prop as string]
          : undefined,
      set: (obj, prop, value) =>
        params.includes(prop as string)
        ? obj[prop as string] = value
        : false,
    });
  }
}
