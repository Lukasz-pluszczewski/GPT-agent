import wiki, { Page, RawPage } from 'wikijs';

type PageOverwrites = Omit<Page & RawPage, 'content'> & {
  content: () => Promise<{ title: string, content: string }[]>;
};

export const getPage = async (query: string) => {
  const page = await wiki().find(query);

  return page as unknown as PageOverwrites;
};

export const getPageContent = async (page: PageOverwrites) =>
  (await page.content()).map(el => `${el.title}\n${el.content}`).join('\n');
