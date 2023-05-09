import { DynamicTool } from 'langchain/tools';
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from 'langchain/prompts'
import { evaluate } from 'mathjs';

import { searchDuckDuckGo } from '../scrapper/searchDuckDuckGo';
import { loadPageHtml } from '../scrapper/loadPageHtml';
import { extractContents } from '../scrapper/extractContents';
import { getPage as getWikipediaPage, getPageContent as getWikipediaPageContent } from '../scrapper/wikipedia';
import { validateUrl } from '../utils/validateUrl';
import { limitWords } from '../utils/limit';
import { solveEquation } from '../utils/equationSolver';



const retrieveInformationPrompt = new PromptTemplate({
  template: 'In a text below find the following information: "{what}"\n\n{text}',
  inputVariables: ['what', 'text'],
});
export const retrieveInformation = async (what: string, text: string) => {
  const model = new OpenAI();

  const limited = limitWords(text, 1000);

  const prompt = await retrieveInformationPrompt.format({ what, text: limited });
  const result = await model.call(prompt);

  return result;
};

export const CalculatorTool = () =>
  new DynamicTool({
    name: 'calculator',
    description: 'Calculates an expression. It can\'t solve equations, it will just return the result of the expression. Only one expression can be evaluated at a time.',
    func: async (input: string) => {
      try {
        return evaluate(input).toString();
      } catch (error) {
        return 'I don\'t know how to do that.';
      }
    },
  });

export const EquationSolverTool = () =>
  new DynamicTool({
    name: 'equation-solver',
    description: 'Solves an equation. It will return a list of solutions.',
    func: async (input: string) => {
      try {
        const results = await solveEquation(input);
        return `The solutions are: ${results.join(', ')}`;
      } catch (error) {
        return 'I don\'t know how to do that.';
      }
    }
  });

export const WebSearchTool = () =>
  new DynamicTool({
    name: 'search',
    description: 'Search the web. This tool will return an array of links with hrefs and titles in JSON format.',
    func: async (input: string) => {
      const results = await searchDuckDuckGo(input);

      return JSON.stringify(results.map(el => ({ href: el.href, title: el.title })).slice(0, 5))
    },
  });

export const WebSiteTool = () =>
  new DynamicTool({
    name: 'website',
    description: 'Loads contents of a website. This tool will return the text of the website. It\'s input must be a url and nothing more.',
    func: async (url: string) => {
      if (!validateUrl(url)) {
        throw new Error(`Invalid url: ${url}`);
      }
      const pageHtml = await loadPageHtml(url);
      const contents = extractContents(pageHtml);

      return limitWords(contents.text, 500);
    },
  });

export const WebsiteParserTool = () =>
  new DynamicTool({
    name: 'website-parser',
    description: 'Retrieves specific information from the given URL (e.g. one found with search tool). Be fairly descriptive as it comes to the information you need, it is a prompt for LLM. Accepts JSON as input: ["http://wikipedia.com/nigeria", "What is the capital"].',
    func: async (input: string) => {
      const [url, what] = JSON.parse(input);
      if (!validateUrl(url)) {
        throw new Error(`Invalid url: ${url}`);
      }
      const pageHtml = await loadPageHtml(url);
      const contents = extractContents(pageHtml);

      const result = await retrieveInformation(what, contents.text);

      return result;
    }
  });

export const NoOpTool = () =>
  new DynamicTool({
    name: 'reflect',
    description: 'No operation. Use this tool if no tool is needed, you just need to reflect on previous actions. It still requires input (although it can be empty).',
    func: async (input: string) => {
      return '';
    },
  });

export const WikipediaTool = () =>
  new DynamicTool({
    name: 'wikipedia',
    description: 'Searches Wikipedia for the given input. Returns the text contents of the article, if found.',
    func: async (input: string) => {
      const page = await getWikipediaPage(input);
      const pageContent = await getWikipediaPageContent(page);

      return `"${page.title}"\n\n${limitWords(pageContent, 500)}`
    },
  });

export const WikipediaParserTool = () =>
  new DynamicTool({
    name: 'wikipedia-parser',
    description: 'Retrieves specific information from the Wikipedia article. Be fairly descriptive as it comes to the information you need, it is a prompt for LLM. Accepts JSON as input: ["Nigeria", "What is the capital?"].',
    func: async (input: string) => {
      const [article, what] = JSON.parse(input);
      const page = await getWikipediaPage(article);
      const pageContent = await getWikipediaPageContent(page);

      const result = await retrieveInformation(what, pageContent);

      return result;
    }
  });

export const ClockTool = () =>
  new DynamicTool({
    name: 'clock',
    description: 'Returns the current time in as ISO string.',
    func: async () => {
      return new Date().toISOString();
    },
  });
