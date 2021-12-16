import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const usePuppeteerStealth = async ({ headless = true, abort = ['image', 'font', 'stylesheet'] }) => {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: headless,
    args: ['--no-sandbox']
  });

  const page = (await browser.pages())[0];
  await page.setDefaultNavigationTimeout(0); 

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if ([...abort].includes(request.resourceType()))
      request.abort();
    else
      request.continue();
  });
  return { browser, page };
}

export const getApiCallHeaders = async (page, url) => {
  return new Promise(async (resolve, reject) => {
    let resolved = false;
    try {
      const devtools = await page.target().createCDPSession();
      await devtools.send('Network.enable');
      await devtools.send('Network.setRequestInterception', {
        patterns: [{ urlPattern: '*' }],
      });
      devtools.on('Network.requestIntercepted', async (event) => {
        if (resolved) return;
        if (/\/graphql$/.test(event.request.url)) {
          resolved = true;
          resolve(event.request.headers);
          return;
        }
        await devtools.send('Network.continueInterceptedRequest', {
          interceptionId: event.interceptionId,
        });
      });
      await page.goto(url, { waitUntil: 'domcontentloaded' },);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        reject(error);
      }
    }
  });
}

export default usePuppeteerStealth;