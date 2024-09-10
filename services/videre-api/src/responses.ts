/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/


export interface ErrorResponse {
  object: 'error',
  status: number,
  reason: string,
  message: string,
  body?: any
};

/**
 * Creates an error response with the specified status, message, and optional body.
 * @param status The HTTP status code of the error response.
 * @param message The error message.
 * @param body The optional body of the error response.
 * @returns The error response.
 */
export function Error(status = 500, message: string, body?: any): Response {
  const statusText = ({
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    408: 'Request Timeout',
    500: 'Internal Server Error',
  })[status] || 'Unknown Error';

  const error = {
    object: 'error',
    status,
    reason: statusText,
    message,
    body
  } as ErrorResponse;

  return asJSON(error, { status, statusText });
}

/**
 * Converts the specified body to a JSON response with the specified options.
 * @param body The body to convert to JSON.
 * @param options The options for the JSON response.
 * @returns The JSON response.
 */
export function asJSON(body: any, { headers = {}, ...rest }: ResponseInit = {}) {
  // Guard against invalid inputs.
  if (body === undefined || body instanceof Response) return body;

  return new Response(JSON.stringify(body), {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...rest
  });
}
