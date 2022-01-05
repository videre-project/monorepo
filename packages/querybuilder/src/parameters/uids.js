/**
 * Parse and pre-validate 'uids' parameter
 * @param {Number|String|Array.<Number|String>} uids 
 * @param {Boolean} numerical Controls matching for either numerical or alphanumerical uids.
 * @returns {Array.<Number|String>} An array of parsed uids.
 * 
 * @example parseUIDs(1234567, false) -> [1234567]
 * @example parseUIDs('r1234567', false) -> [1234567]
 * @example parseUIDs(['cef885g', ...], true) -> ['cef885g', ...]
 */
export const parseUIDs = (uids, alphanumerical = false) => {
  const _uids = Array.isArray(uids)
    ? uids
    : [uids];

  const parsedUIDS = _uids
    .map(id => `${id}`.match(
      alphanumerical
        ? /[A-Za-z0-9-]+/g
        : /[0-9]+/g
      ).join('')
    ).flat(1)
    .filter(Boolean)
    .map(id => alphanumerical ? id : parseInt(id));

  return Array.isArray(uids)
    ? parsedUIDS
    : parsedUIDS?.[0];
}

export default parseUIDs;