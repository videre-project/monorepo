// import { sql } from './database';
// import MTGO from 'magic';

/**
 * Get request parameters by alias.
 */
export const getParams = (query, ...props) =>
  [].concat.apply([], props?.map(prop => query?.[prop]).filter(Boolean));

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
export const groupQuery = ({ query, _mainParam, _param1, _param2, _param3 }) => {
  // Enumerate parameters to declare final item in array as parameter name.
  const mainParam = _mainParam?.slice(-1)[0];
  const param1 = _param1?.slice(-1)[0];
  const param2 = _param2?.slice(-1)[0];
  const param3 = _param3?.slice(-1)[0];

  let i = 0;
  let params = query.map(_param => {
    const [_parameter, value] = _param.split(/>=|<=|>|<|=|!=/g);
    let parameter = [_mainParam, _param1, _param2, _param3]
      .filter(Boolean)
      .map(param =>
        param
          .map(p => (isNaN(p) ? p?.toLowerCase() : p))
          .includes(_parameter?.toLowerCase())
          ? param?.slice(-1)[0]
          : false
      )
      .filter(Boolean)
      ?.flat(1);
    if (typeof parameter == 'object') parameter = parameter[0];
    if (parameter === mainParam) i++;
    const [operator] = _param.match(/>=|<=|>|<|=|!=/g);
    return {
      group: i > 0 ? i : 1,
      parameter: parameter,
      operator: operator,
      value: !isNaN(value) ? Number(value) : value,
    };
  });
  [mainParam, param1, param2, param3].filter(Boolean).map(_param => {
    [...new Set(params.map(obj => obj.group))].forEach(group => {
      let i = 0;
      let g = 0;
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

/**
 * Removes duplicate query parameters.
 */
export const removeDuplicates = query =>
  Object.keys(query)
    .map(param => ({
      [param]:
        typeof query[param] === 'object'
          ? query[param]?.length > 1
            ? query[param][0]
            : []
          : query[param],
    }))
    .reduce((r, c) => Object.assign(r, c), {});