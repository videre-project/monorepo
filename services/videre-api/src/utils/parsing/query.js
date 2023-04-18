import fetch from 'node-fetch';

import { express } from '@videre/querybuilder';
const { groupQuery } = express;

export function extractQuery(query) {
  // Group query parameters by named params and aliases.
  const queryParams = groupQuery({
    query: query,
    _mainParam: ['card', 'name', 'cardname'],
    _param1: ['qty', 'quantity'],
    _param2: ['is', 'c', 'cont', 'container'],
  });

  // Match query against params and extract query logic.
  const _query = [...new Set(queryParams.map(obj => obj.group))]
    .map(group => queryParams.filter(obj => obj.group == group))
    .flat(1);

  // Handle missing query edge case
  if (_query?.length == 1 && _query[0]?.value === 0) {
    return null;
  }

  return _query;
};

export async function parseQuery(parsedQuery) {
  let ignoredGroups = [];

  // Remove unmatched cards from query conditions.
  let _query = await Promise.all(
    parsedQuery
      .map(async obj => {
        if (obj.parameter == 'cardname') {
          const request = await fetch(
            `https://api.scryfall.com/cards/named?fuzzy=${obj.value}`
          ).then(response => response.json());
          if (!request?.name) ignoredGroups.push(obj.group);
          return { ...obj, value: request?.name || null };
        }
        if (obj.parameter == 'quantity') {
          if (isNaN(obj.value)) {
            ignoredGroups.push(obj.group);
            return { ...obj, value: null };
          }
        }
        if (obj.parameter == 'container') {
          if (!['mainboard', 'sideboard'].includes(obj.value)) {
            ignoredGroups.push(obj.group);
            return { ...obj, value: null };
          }
        }
        return obj;
      })
      .filter(Boolean)
  );

  // Handle qty = 0 edge case
  _query.forEach((obj, _i) => {
    if (obj.parameter == 'quantity' && obj.value <= 0) {
      const queryGroup = _query.filter(_obj => _obj.group == obj.group);
      const mainKey = queryGroup.find(_obj => _obj.parameter == 'cardname');
      if (queryGroup?.length && mainKey) {
        _query = _query
          .map((condition, i) => {
            if (condition.group === obj.group && condition.parameter === 'cardname') {
              return { ...condition, operator: '!=' };
            } else if (_i !== i) return condition;
            return;
          }).filter(Boolean);
      } else {
        _query = _query.filter(_obj => _obj.group != obj.group);
      }
    }
  });

  return { ignoredGroups, _query };
};

export default parseQuery;