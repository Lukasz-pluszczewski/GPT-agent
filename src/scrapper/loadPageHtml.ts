import puppeteer, { Browser } from 'puppeteer';

export const loadPageHtml = async (pageUrl: string, waitForSelector?: string): Promise<string> => {
  let browser: Browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 10000 });
    }

    const pageContent = await page.content();
    return pageContent;
  } catch (error) {
    console.error(`Failed to load content from ${pageUrl}: ${error}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
