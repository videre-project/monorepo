/* @file
 * Basic character codes for js object arrays.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Get the char code of `str`.
 */
export const char = (str: string): number => str.charCodeAt(0);

/**
 * Character code for `,`
 */
export const comma = char(',');
/**
 * Character code for `{`
 */
export const obrace = char('{');
/**
 * Character code for `}`
 */
export const cbrace = char('}');
/**
 * Character code for `[`
 */
export const obracket = char('[');
/**
 * Character code for `]`
 */
export const cbracket = char(']');
/**
 * Character code for `:`
 */
export const colon = char(':');
/**
 * Character code for `""`
 */
export const mark = char('"');
/**
 * Character code for `\`
 */
export const backslash = char('\\');
