export function getQueryWarnings(query, ignoredGroups, _query) {
  function getValue (parameter) {
    return _query
      .filter(obj =>
        obj.parameter == parameter
        && obj.group == group
      ).map(obj => obj.value)[0];
  };

  const uniqueGroups = [...new Set(
      query.map(obj => obj.group)
    )].filter(Boolean)
    .filter(group => ignoredGroups.includes(group));

  // Query errors
  let warnings = ignoredGroups.length
    ? {
        errors: [
          // Query errors
          ...uniqueGroups
            .map(group => {
              const errors = query
                .filter(obj =>
                  obj.value === null
                  && obj.group == groupQuery
                ).map(obj => obj.parameter);
              const condition = _query
                .filter(obj => obj.group == group)
                .map(_obj =>
                  [
                    _obj.parameter.toLowerCase(),
                    _obj.operator,
                    !isNaN(_obj.value)
                      ? _obj.value
                      : `'${_obj.value || ''}'`,
                  ].join(' ')
                ).join(' and ');

              return [
                'T' +
                  [
                    errors.includes('cardname')
                      && `the card '${getValue('cardname')}' could not be found`,
                    errors.includes('quantity')
                      && `the quantity '${getValue('quantity')}' is not a number`,
                    errors.includes('container')
                      && `the container '${getValue('container')}' does not exist`,
                  ]
                    .filter(Boolean)
                    .join(', ')
                    .replace(/, ([^,]*)$/, ' and $1')
                    .slice(1) +
                  '.',
                `Condition ${group} “${condition}” was ignored.`,
              ]
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            })
            .flat(1),
        ],
      }
    : {};

  // Query warnings
  warnings.warnings = [
    // ...(warnings?.warnings || []),
    ...[
      ...new Set(
        query
          .filter(obj => obj.parameter == 'quantity' && obj.value <= 0)
          .map(obj => obj.group)
      ),
    ]
      .map(group => {
        const getValue = parameter =>
          _query
            .filter(obj => obj.group == group)
            .filter(obj => obj.parameter == parameter)
            .map(obj => obj.value)[0];
        return [
          `Condition ${group} parameter 'quantity' with value '${getValue(
            'quantity'
          )}' is less than 1.`,
          `Please use “cardname != ${getValue('cardname')}” instead. Corrected.`,
        ]
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      })
      .flat(1),
  ];
  if (!warnings.warnings.length) delete warnings.warnings;

  return warnings;
};