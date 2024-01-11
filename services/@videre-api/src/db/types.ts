/* @file
 * Copyright (c) 2023, Cory Bennett. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/

import { FORMATS, EVENTS } from "./constants";


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
export type ResultType = 'win' | 'loss' | 'draw';
