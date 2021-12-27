import { getParams } from './url-params';

/**
 * Parse arguments from request query parameter.
 */
export const getQueryArgs = query =>
  getParams(query, 'q', 'query').map(obj => {
    // Split query parameters by space.
    let _query = obj.trim().split(' ');
    let args = [];
    let offset = 1;
    // Group parameter by condition syntax for parameters/values involving spaces.
    _query.forEach((_arg, i) => {
      const condition =
        (/>=|<=|>|<|=|!=/g.test(_arg) && _arg.replace(/>=|<=|>|<|=|!=/g, '').length) ||
        !args[i - offset];
      if (condition) args.push(_arg);
      else {
        args[i - offset] += ' ' + _arg;
        offset++;
      }
    });
    // Return only 
    return args.filter(_obj => />=|<=|>|<|=|!=/g.test(_obj));
  });

/**
 * Group query parameters by main query parameter type.
 */
export const groupQuery = ({ query, _mainParam, ..._args }) => {
  if (!query?.length) return [];
  // Enumerate parameters to map final item in array as parameter name.
  const mainParam = _mainParam?.slice(-1)[0];
  const args = [...Object.values(_args)]
    .map(_arg =>
      typeof _arg == 'object'
        ? _arg.slice(-1)[0]
        : _arg
    );

  let i = 0; // Tracks number of groups found by mainparam.
  let params = query.map(_param => {
    // Splits 'parameter >= value' to [parameter, value].
    const [_parameter, value] = _param.split(/>=|<=|>|<|=|!=/g);
    // Enumerate all parameters to match ^ extracted parameter.
    let parameter = [_mainParam, ...Object.values(_args)]
      .map(param =>
        param // Do case-insensitive match
          .map(p => (isNaN(p) ? p?.toLowerCase() : p))
          .includes(_parameter?.toLowerCase())
            ? param?.slice(-1)[0]
            : null
      ).flat(1)
      .filter(Boolean);
    // Check if matched parameter is the mainParam.
    if (typeof parameter == 'object') parameter = parameter[0];
    if (parameter === mainParam) i++; // Increment group index.
    // Explicitly extract condition operator.
    const [operator] = _param.match(/>=|<=|>|<|=|!=/g);
    return {
      group: i > 0
        ? i
        : 1,
      parameter: parameter,
      operator: operator,
      value: !isNaN(value)
        ? Number(value)
        : value,
    };
  });
  // Enumerate parameters and repartition groups.
  [mainParam, ...args]
    .filter(Boolean)
    .forEach(_param => {
      [...new Set(params.map(obj => obj.group))]
        .forEach(group => {
          let i = 0; // param count within current group.
          let g = 0; // current group index.
          params.forEach((obj, _i) => {
            if (obj.group == group && obj.parameter == _param) i++;
            if (g > 0 && g !== obj.group) i = 0;
            g = obj.group;
            if (i > 1) {
              params[_i] = {
                group: obj.group + 1,
                ...obj,
              };
            }
          });
        });
    });
  return params;
};