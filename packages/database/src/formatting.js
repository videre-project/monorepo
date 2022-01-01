/**
 * Converts an integer to an ordinal.
 * @param {Number} num Input integer.
 * @returns Stringified ordinal number.
 * @example getNumberWithOrdinal(21) -> '21st'
 */
export const getNumberWithOrdinal = num => {
  let seq = ['th', 'st', 'nd', 'rd'],
    val = num % 100;
  return num + (seq[(val - 20) % 10] || seq[val] || seq[0]);
};

/**
 * Converts text to Pascal case.
 * @param {String} text Input text
 * @returns Pascalcase text.
 * @example toPascalCase('input') -> 'Input'
 * @example toPascalCase('input-value') -> 'Input Value'
 */
export const toPascalCase = (text) => {
  if (text.includes('-')) {
    return text
      .replaceAll(' ', '-')
      ?.match(/[a-zA-Z-]+/g)
      .map(x =>
        x.split(/-/g)
        .map(type => toPascalCase(type))
        .join(' ')
      ).flat(1)
      .join('');
  } else {
    return text.charAt(0).toUpperCase() + text.slice(1);
  } 
}

/**
 * Removes undefined object keys.
 */
 export const pruneObjectKeys = object => {
  return Object.entries(object)
    .filter(([, v]) =>
      typeof v == 'object'
        ? (v != null && JSON.stringify(v) != '{}' && JSON.stringify(v) != '[]')
        : v != undefined
    ).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
};