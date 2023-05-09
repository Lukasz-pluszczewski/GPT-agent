import qs from 'querystring';
import cheerio from 'cheerio';

import { loadPageHtml } from './loadPageHtml';

export const searchDuckDuckGo = async (query: string) => {
  const queryString = qs.stringify({
    q: query,
    kaj: 'm',
  });

  const html = await loadPageHtml(`https://duckduckgo.com/?${queryString}`, '#links article');

  const $ = cheerio.load(html);

  const results = $('#links article').map((i, el) => {
    const wrappedEl = $(el);

    const href = wrappedEl.find('a[data-testid="result-extras-url-link"]').attr('href');
    const title = wrappedEl.find('a[data-testid="result-title-a"]').text();
    const description = $(wrappedEl.children('div').get(2)).text();
    return {
      href,
      title,
      description,
    };
  }).toArray();

  return results;
}
