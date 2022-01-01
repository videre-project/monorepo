import {
  SearchTags as _SearchTags,
  FetchTag as _FetchTag
} from './internal/templates';

// Expose Tagger GraphQL 'SearchTags' method.
export const SearchTags = ({ headers, input }) => ({
  'method': 'POST',
  'body': JSON.stringify({
    "operationName": "SearchTags",
    "variables": { input: { name: null, ...input } },
    "query": _SearchTags
  }),
  'headers': headers
});

// Expose Tagger GraphQL 'FetchTag' method.
export const FetchTag = ({ headers, input }) => ({
  'method': 'POST',
  'body': JSON.stringify({
    "operationName": "FetchTag",
    "variables": { descendants: true, ...input },
    "query": _FetchTag
  }),
  'headers': headers,
});