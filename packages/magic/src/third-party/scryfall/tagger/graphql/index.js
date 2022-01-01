import { TAG_PATH } from '../.';

export * from './methods';

export const GRAPHQL_PATH = 'https://tagger.scryfall.com/graphql';

export const formatTags = (self, filter = true) => {
  return self
    .flat(1)
    .filter(({ status }) =>
      status === 'GOOD_STANDING'
    ).map(tag => ({
      uid: tag.id,
      name: tag.slug,
      displayName: tag.name,
      description: tag.description,
      type: tag.type == 'ORACLE_CARD_TAG'
        ? 'oracletag'
        : 'art',
      url: `${TAG_PATH}${tag.slug}`,
      category: tag.category,
      count: tag.taggingCount,
      ancestry: tag.ancestry,
      childTags: tag.childTags
    })).filter(obj => !filter || obj.category || obj.count > 1)
    .sort((a, b) => (a.count < b.count ? 1 : -1));
}

export const formatTagCategories = (self) => ({
  categories: self
    .filter(({ category }) => category)
    .map(({ category, ...rest }) => ({
      object: 'category',
      ...rest
    })),
  tags: self
    .filter(({ category }) => !category)
    .map(({ category, ...rest }) => ({
      object: 'tag',
      ...rest
    }))
});

export const formatTaggings = (self) => {
  return self
    .flat(1)
    .filter(({ status }) =>
      status == 'GOOD_STANDING'
    ).map(({ card, id, status, ...rest }) => ({
      uid: card.oracleId,
      name: card.name,
      taggingId: id,
      ...rest
    }));
}