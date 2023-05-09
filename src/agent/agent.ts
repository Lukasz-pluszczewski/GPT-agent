import { LLMChain } from 'langchain/chains';
import { AgentExecutor, ZeroShotAgent } from 'langchain/agents';
import { BaseCallbackHandler } from 'langchain/callbacks';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { DynamicTool, ChainTool, Tool } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { WebBrowser } from 'langchain/tools/webbrowser';
import { AgentAction } from 'langchain/schema';

import {
  NoOpTool,
  CalculatorTool,
  WebSearchTool,
  WebsiteParserTool,
  WikipediaParserTool,
  WikipediaTool,
  ClockTool, EquationSolverTool,
} from './tools';
import { MODEL } from '../constants';

type Callbacks = {
  onToken?: (token: string, runId: string, parentRunId?: string) => void;
  onAction?: (action: AgentAction, runId: string, parentRunId?: string) => void;
  onChainStart?: (chain: { name: string }, inputs: string[], runId: string, parentRunId?: string) => void;
  onToolStart?: (tool: { name: string }, input: string, runId: string, parentRunId?: string) => void;
  onToolEnd?: (output: string, runId: string, parentRunId?: string) => void;
}
const createCallbackHandler = (name: string, { onToken, onAction, onChainStart, onToolStart, onToolEnd }: Callbacks) => BaseCallbackHandler.fromMethods({
  handleLLMNewToken(token: string, runId: string, parentRunId?: string) {
    onToken?.(token, runId, parentRunId);
  },
  handleLLMStart(llm, prompts: string[], runId: string, parentRunId?: string) {
    // console.log(`${name} handleLLMStart`, { llm, _prompts });
    onChainStart?.(llm, prompts, runId, parentRunId);
  },
  handleChainStart(chain, inputs) {
    // console.log(`${name} handleChainStart`, { chain, inputs });
  },
  handleAgentAction(action, runId: string, parentRunId?: string) {
    // console.log(`${name} handleAgentAction`, action);
    onAction?.(action, runId, parentRunId);
  },
  handleToolStart(tool, input, runId: string, parentRunId?: string) {
    // console.log(`${name} handleToolStart`, { tool, input });
    onToolStart?.(tool, input, runId, parentRunId);
  },
  handleToolEnd(output: string, runId: string, parentRunId?: string): Promise<void> | void {
    onToolEnd?.(output, runId, parentRunId);
  }
});

export type AgentOptions = {
  model?: string,
} & Callbacks;
export const agent = async (
  prompt: string,
  { model: modelName, onToken, onAction, onChainStart, onToolStart, onToolEnd }: AgentOptions
) => {
  const callbackHandler = createCallbackHandler('1', { onToken, onAction, onChainStart, onToolStart, onToolEnd });

  const model = new ChatOpenAI({
    modelName,
    temperature: 0,
    streaming: true,
  });

  const tools = [
    NoOpTool(),
    // new Calculator(),
    CalculatorTool(),
    EquationSolverTool(),
    WebSearchTool(),
    WebsiteParserTool(),
    WikipediaParserTool(),
    // WikipediaTool(),
    ClockTool(),
  ];
  const noopToolIsIncluded = tools.some((tool) => tool.name === 'noop');
  const agentPrompt = ZeroShotAgent.createPrompt(tools, {
    prefix: `Answer the following questions as best you can. Use tools only if necessary. ${noopToolIsIncluded ? '' : 'If you don\'t use tools, you must give final answer. '}If you can\'t give any answer, answer with simple error massage like "I can\'t answer that" with short explanation. You don\'t have to use any tools. If there are no tools that can answer the question, answer without any tools. You have access to the following tools: `,
  });
  // console.log('agentPrompt', agentPrompt);

  const llmChain = new LLMChain({
    llm: model,
    prompt: agentPrompt,
  });
  const agent = new ZeroShotAgent({
    llmChain,
    // allowedTools: ['search'],
  });

  const agentExecutor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
  });

  const result = await agentExecutor.call(
    {
      input: prompt,
    },
    [callbackHandler]
  );

  return result;
};
