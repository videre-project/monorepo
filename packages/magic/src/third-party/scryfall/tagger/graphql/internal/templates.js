export const SearchTags = `query SearchTags($input: TagSearchInput!) {
    tags(input: $input) {
        perPage
        results {
            ...TagAttrs
            description
            taggingCount
            ancestry {
                tag {\nid\n}
            }
            childTags {\nid\n}
        }
        total
    }
}\n
fragment TagAttrs on Tag {
    category
    id
    name
    slug
    status
    type
}`;