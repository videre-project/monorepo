/* @file
 * Copyright (c) 2024, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { FORMATS, EVENTS, RESULTS } from "./constants";


/**
 * A constructed format type.
 */
export type FormatType = typeof FORMATS[number];

/**
 * A tournament event type.
 */
export type EventType = typeof EVENTS[number];

/**
 * Represents a best-of-three match record.
 */
export type RecordType =
  `${string}-${string}` |
  `${string}-${string}-${string}`;

/**
 * Represents a match result.
 */
export type ResultType = typeof RESULTS[number];

/**
 * Represents a card entry in a decklist.
 */
export type CardQuantityPair = {
  id: number,
  name: string,
  quantity: number
};
