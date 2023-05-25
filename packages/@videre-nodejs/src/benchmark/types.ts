/* @file
 * Helper types for benchmarking.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


export interface stats {
  mean: number,
  std: number,
  unit: 's' | 'ms' | 'us' | 'ns'
};
