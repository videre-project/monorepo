import chalk from 'chalk';
import { fetch } from 'fetch-h2';
import { JSDOM } from 'jsdom';

import { parseTime, CLI_CLEAR_CONSOLE } from '@packages/cli';
import { setDelay } from '@packages/database';

import { API_PATH, DOCS_PATH } from './../constants.js';

export * from './graphql';

/*
 * Get list of Scryfall tags.
 */
export const getScryfallTags = async (type = 'functional') => {
  const response = await fetch(`${DOCS_PATH}tagger-tags`);
  const html = await response.text();
  const { document } = new JSDOM(html).window;

  const sections = Array.from(document.querySelectorAll('div.prose h2'));
  const tags = sections.reduce((output, section) => {
    const sectionType = section.textContent.endsWith('(functional)')
      ? 'oracletag'
      : 'art';

    const links = Array.from(section.nextElementSibling.querySelectorAll('a'));
    links.forEach(({ text, href }) => {
      output.push({
        name: text,
        type: sectionType,
        url: `${API_PATH}cards${href}`
      });
    });

    return output.filter(obj => (type?.length ? type.includes(obj.type) : true));
  }, []);

  return tags;
};

/*
 * Fetch Scryfall tags' data by tag.
 */
export const getTaggedCards = async (_tags, delay = 100) => {
  let tags = [];
  const startTime = Date.now();
  for (let i = 0; i < _tags.length; i++) {
    const _tag = _tags[i];

    CLI_CLEAR_CONSOLE();
    const _progress = (((i + 1) / _tags.length) * 100).toFixed(2);
    console.log(`Scraping '${chalk.yellow(_tag.name)}'...\n${_progress}% complete. (${i + 1}/${_tags.length})`);

    // Get average rate towards completion in nearest days, hours, minutes and seconds
    const queueRate = (Date.now() - startTime) / (1000 * (i + 1)); // in seconds
    console.log(`About ${parseTime((_tags.length - (i + 1)) * queueRate)} remaining.\n`);

    // Ensure 100 ms delay between requests.
    await setDelay(delay);

    const page = await fetch(_tag.url).then(res => res.json());
    const { has_more, total_cards = 0, data = [] } = page;
    let url = page?.next_page;

    // Handle multiple pages of results.
    if (has_more) {
      const numPages = Math.ceil(total_cards / data.length);
      for (let i = 2; i <= numPages; i++) {
        await setDelay(delay);
        const nextPage = await fetch(url).then(res => res.json());
        url = nextPage.next_page;
        data.push(...nextPage.data);
      }
    }
    tags.push({
      ..._tag,
      count: total_cards,
      data,
    });
  }
  return tags;
};

/**
 * ... array of
 */
export const getTagsCatalog = async (_tags) => {
  // Get list of Scryfall tags.
  const tags = [...new Set(_tags || await getScryfallTags())];
  // Get Scryfall tags data.
  const tagData = await getTaggedCards(tags, 1000);
  const _cards = [...new Set(tagData.map(obj => obj.data).flat(1))];

  const uniqueCards = [...new Map(_cards.map(item => [item.id, item])).values()]
    .map(({ object, oracle_id, name }) => ({
      object,
      name,
      oracle_id,
      tags: tagData
        .map(({ uid, data }) =>
          data.filter(_obj =>
            _obj.oracle_id === oracle_id
          ).length && uid
        ).filter(Boolean)
        .flat(2),
      })
    );

  const uniqueTags = tagData
    .map(({ uid, name, type, url }) => ({
      object: 'tag',
      uid,
      name,
      type,
      url,
      count: uniqueCards.filter(({ tags }) =>
        tags.includes(uid)
      ).length,
      exclusive: uniqueCards.filter(({ tags }) =>
        tags.includes(uid)
        && tags.length === 1
      ).length,
    })).filter(obj => obj.count > 1)
    .sort((a, b) => (a.count < b.count ? 1 : -1));

  return {
    cards: uniqueCards.map(({ tags, ...rest }) => ({
      ...rest,
      tags: tags
        .flat(2)
        .map(tag =>
          uniqueTags
            .filter(({ uid }) => uid == tag)
            ?.[0]
        ).filter(Boolean).flat(1),
    })).filter(({ tags }) => tags?.length),
    tags: uniqueTags,
  };
};