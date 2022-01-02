import { setDelay } from '@videre/database';
import { FIRST_PARTY, THIRD_PARTY } from '@videre/magic';

const { formatTaggerCatalog, formatTaggerObjects } = FIRST_PARTY.tags;
const { formatTags, formatTaggings } = THIRD_PARTY.scryfall.TAGGER;

// Temporary workaround for fetch-h2 opinions.
import { SearchTags, FetchTag } from './h2-patch';

import { getApiCallHeaders } from '../scraper/puppeteer';

/**
 * Get Scryfall Tagger tags metadata w/ taggings.
 */
export const getTagsData = async (page) => {
  // Extract session headers/cookie from tagger website.
  const headers = await getApiCallHeaders(page, 'https://tagger.scryfall.com/');

  let json = await SearchTags({ headers });

  let { perPage, total, results } = json.data.tags;
  let num_pages = 2 || Math.ceil(total / perPage);

  // Enumerate tag pages
  let data = [results];
  for (let i = 1; i < num_pages; i++) {
    await setDelay(1000);
    json = await SearchTags({ page: i + 1, headers });
    data.push(json.data.tags.results);
  }

  // Format tag metadata.
  data = formatTags(data);
  await setDelay(100);

  // Enumerate card tagging pages.
  let _taggings = {};
  for (let i = 0; i < data.length; i++) {
    let { name: slug } = data[i];
    json = await FetchTag({ slug, headers });

    let { perPage: _perPage, total: _total } = json.data.tag.taggings;
    num_pages = Math.ceil(_total / _perPage);

    // Enumerate tagging pages.
    let _data = [json.data.tag.taggings];
    for (let i = 1; i < num_pages; i++) {
      await setDelay(100);
      json = await FetchTag({ page: i + 1, slug, headers });
      _data.push(json.data.tag.taggings.results);
    }

    // Create index for tag id.
    _taggings[json.data.tag.id] = formatTaggings(_data)
  }

  // Combine results under a monolitic object array.
  const tagData = formatTaggerCatalog(data, _taggings);

  return formatTaggerObjects(tagData);
}

export default getTagsData;