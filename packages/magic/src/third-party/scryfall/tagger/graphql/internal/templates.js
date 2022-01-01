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

export const FetchTag = `query FetchTag($type: TagType!, $slug: String!, $page: Int = 1, $descendants: Boolean = false) {
  tag: tagBySlug(type: $type, slug: $slug, aliasing: true) {
    id
    taggings(page: $page, descendants: $descendants) {
      page
      perPage
      total
      results {
        ...TaggingAttrs
        card {
          ...CardAttrs
        }
      }
    }
  }
}

fragment CardAttrs on Card {
  name
  oracleId
}

fragment TaggingAttrs on Tagging {
  annotation
  id
  status
  weight
}`;