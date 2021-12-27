/**
 * Converts a vanilla or camelCase string to SNAKE_CASE.
 */
export const snakeCase = string =>
  string
    .replace(/[A-Z]/g, char => `_${char}`)
    .replace(/\s+|_+/g, '_')
    .toUpperCase();

/**
 * Converts a vanilla string to pascalCase.
 */
export const toPascalCase = text => text.charAt(0).toUpperCase() + text.slice(1);