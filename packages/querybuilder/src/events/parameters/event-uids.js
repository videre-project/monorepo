import { getParams } from './../../url-query';
import { paramAliases } from '.';

// Parse and pre-validate 'uids' parameter
export const parseUIDS = (query, uids) => {
  return (uids || getParams(query, ...paramAliases.uids))
    .map(id => [...id.split(',')].map(_id => _id.match(/[0-9]+/g).join('')) || null)
    .flat(1)
    .filter(Boolean);
}