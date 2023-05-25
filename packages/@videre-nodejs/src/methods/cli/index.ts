/* @file
 *
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
*/


export * from './argv';

/**
 * Clear last line of console output.
 */
export function CLI_REMOVE_LINE() { process.stdout.write('\r\x1b[K'); }

/**
 * Clear entire console output.
 */
export function CLI_CLEAR_CONSOLE() { process.stdout.write('\x1Bc'); };
