/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/


/**
 * Default query parameter values.
 */
export const PARAMETERS: { [key: string]: any } = {
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
};
