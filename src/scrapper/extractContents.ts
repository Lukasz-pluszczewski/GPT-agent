import extract from 'unfluff';

export type Results = {
  title:         string;
  softTitle:     string;
  date:          Date;
  copyright:     string;
  author:        string[];
  publisher:     string;
  text:          string;
  image:         string;
  tags:          any[];
  videos:        any[];
  canonicalLink: string;
  lang:          string;
  description:   string;
  favicon:       string;
  links:         Link[];
}

export type Link = {
  text: string;
  href: string;
}

export const extractContents = (html: string): Results => {
  const data = extract(html);

  return data;
}
