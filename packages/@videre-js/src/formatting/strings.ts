/* @file
 * Formatting methods for strings.
 *
 * Copyright (c) 2023, The Videre Project Authors. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Converts a vanilla or camelCase string to snake_case.
 * @param text Input text
 * @returns snake_case text.
 * @example toSnakeCase('vanilla') -> 'vanilla'
 * @example toSnakeCase('camelCase') -> 'camel_case'
 */
export function toSnakeCase(text: string): string {
  return text
    // Separate capitalization with underscores
    .replace(/[A-Z]/g, char => `_${char}`)
    // Replace non-alphanumeric and whitespace with underscores.
    .replace(/[^a-zA-Z0-9]+|\s+/g, '_')
    // Remove leading underscores
    .replace(/^_+/, '')
    // Coerce all text into lowercase.
    .toLowerCase();
}

/**
 * Converts text to camelCase.
 * @param text Input text.
 * @returns camelCase text.
 * @example toCamelCase('input') -> 'Input'
 * @example toCamelCaes('input-text') -> 'InputText'
 */
export function toCamelCase(text: string): string {
  return text
    // Separate capitalization with underscores
    .replace(/^[^A-Z]|[A-Z]/g, char => `_${char}`)
    // Replace whitespace or redundant hyphens/underscores/etc.
    .replace(/[^a-zA-Z0-9]+|\s+|_+/g, '_')
    // Coerce all text into lowercase.
    .toLowerCase()
    // Remove leading underscores/hyphens.
    .replace(/^[_|-]+/, '')
    // Convert underscores to capitalization.
    .replace(/_[^A-Z]/g, char => char.toUpperCase().replace('_', ''));
};

/**
 * Converts text to PascalCase.
 * @param text Input text
 * @returns Pascalcase text.
 * @example toPascalCase('input') -> 'Input'
 * @example toPascalCase('input-value') -> 'Input Value'
 */
export function toPascalCase(text: string): string {
  return text
    // Separate first character and capitalization with underscores
    .replace(/^[^A-Z]|[A-Z]/g, char => `_${char}`)
    // Replace non-alphanumeric and whitespace with underscores.
    .replace(/[^a-zA-Z0-9]+|\s+|_+/g, '_')
    // Coerce all text into lowercase.
    .toLowerCase()
    // Convert underscores to capitalization.
    .replace(/_[^A-Z]/g, char => char.toUpperCase().replace('_', ''));
};

/**
 * Converts text to kebab-case.
 * @param text Input text.
 * @returns kebab-case text.
 * @example toKebabCase('Input') -> 'input'
 * @example toKebabCase('Input Text') -> 'input-text'
 */
export function toKebabCase(text: string): string {
  return text
    // Separate capitalization with hyphens
    .replace(/[A-Z]/g, char => `-${char}`)
    // Replace non-alphanumeric and whitespace with hyphens.
    .replace(/[^a-zA-Z0-9]+|\s+/g, '-')
    // Remove leading hyphens.
    .replace(/^-/, '')
    // Coerce all text into lowercase.
    .toLowerCase();
};
