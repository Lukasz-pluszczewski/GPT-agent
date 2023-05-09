import { validateUrl } from './validateUrl';

describe('validateUrl', () => {
  const validUrls = [
    'https://example.com',
    'http://example.com',
    'example.com',
    'https://www.example.com',
    'http://www.example.com',
    'https://example.com/path',
    'https://example.com/path/subpath',
    'https://example.com/path/subpath/file.html',
    'https://www.alanarnette.com/blog/2021/12/13/everest-by-the-numbers-2022-edition/'
  ];
  const invalidUrls = [
    'example',
    'http:/example.com',
    'https//example.com',
    'https://example',
  ];

  validUrls.forEach((url) => {
    it(`should return true for ${url}`, () => {
      expect(validateUrl(url)).toBe(true);
    });
  });
  invalidUrls.forEach((url) => {
    it(`should return false for ${url}`, () => {
      expect(validateUrl(url)).toBe(false);
    });
  });
});
