import { SearchTags as _SearchTags } from './internal/templates';

// Expose Tagger GraphQL 'SearchTags' Method.
export const SearchTags = ({ headers, input }) => ({
    'method': 'POST',
    'body': JSON.stringify({
        "operationName": "SearchTags",
        "variables": { input },
        "query": _SearchTags
    }),
    'headers': headers
});