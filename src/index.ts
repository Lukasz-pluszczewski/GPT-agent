import readline from 'readline/promises';
import { FileHandle } from 'fs/promises';
import path from 'path';

import { agent } from './agent/agent';
import { reflectPromise } from './utils/reflectPromise';
import { createLogFile, saveLogCopy, writePromptToLog } from './writePromptToLog';
import { MODEL } from './constants';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on('close', () => process.exit(0));

const createWriteToConsole = (fileHandle: FileHandle) => async (text: string) => {
  process.stdout.write(text);
  await fileHandle.writeFile(text);
};

const model = MODEL.GPT4;

(async () => {
  console.log('Using model', model || 'default');
  const prompt = await rl.question('\nWrite your prompt\n');

  await writePromptToLog(prompt);
  const [logFile, logFilePath] = await createLogFile(prompt, model);

  const writeToConsole = createWriteToConsole(logFile);
  console.log('\n');

  const [result, error] = await reflectPromise(() =>
    agent(prompt, {
      model,
      onToken: (token: string) => writeToConsole(token),
      // onAction: (action: AgentAction) => writeToConsole(`\n\n${JSON.stringify(action)}\n\n`),
      // onChainStart: (__, inputs) => writeToConsole(`\n\nChain start:\n${inputs.join('\n')}\n\n`),
      onToolStart: (tool, input) => writeToConsole(`\n\nTool "${tool.name}" start: ${input}`),
      onToolEnd: (output: string) => writeToConsole(`\nTool output:\n"${output}"\n\n`),
    })
  );
  if (error) {
    await writeToConsole('\n\nAgent closed with an error');
    await writeToConsole(error.toString());
  } else {
    console.log('\n\nSuccess');
  }

  await logFile.close();

  const logFileCopyName = await rl.question('\nSave log as [leave blank to not save a copy of this log]\n');

  console.log('\nSaved log in', path.relative(path.resolve(__dirname, '..'), logFilePath));
  if (logFileCopyName) {
    const logFileCopyPath = await saveLogCopy(logFilePath, logFileCopyName, model);
    console.log('Saved log copy in', path.relative(path.resolve(__dirname, '..'), logFileCopyPath));
  }

  process.exit(0);
})();
