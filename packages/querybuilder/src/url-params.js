/**
 * Get request parameters by alias.
 */
export const getParams = (query, ...props) =>
  [].concat
    .apply([],
      props
        ?.map(prop => query?.[prop])
        .filter(Boolean)
    );

/**
 * Removes duplicate query parameters.
 */
export const removeDuplicates = query =>
  Object.keys(query)
    .map(param => ({
      [param]:
        typeof query[param] === 'object'
          ? query[param]?.length > 1
            ? query[param]?.[0]
            : []
          : query[param],
    })).reduce((r, c) => Object.assign(r, c), {});