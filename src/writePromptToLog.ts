import path from 'path';
import fs from 'fs/promises';

export const writePromptToLog = async (prompt: string) => {
  const filepath = path.resolve(__dirname, '..', 'logs', 'promptsLog.txt');
  const fileHandle = await fs.open(filepath, 'a');
  await fileHandle.appendFile(`${prompt}\n`);
  await fileHandle.close();
  return;
}
export const createLogFile = async (prompt: string, model: string) => {
  const fileName = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\./g, '-');
  const filepath = path.resolve(__dirname, '..', 'logs', `agentLog__${model || 'default'}__${fileName}.txt`);
  const fileHandle = await fs.open(filepath, 'a');
  await fileHandle.writeFile(`Prompt: ${prompt}\n\n`);

  return [fileHandle, filepath] as const;
};
export const saveLogCopy = async (logFilePath: string, logFileCopyName: string, model: string) => {
  const logFileCopyPath = path.resolve(__dirname, '..', 'savedLogs', `agentLog__${model || 'default'}__${logFileCopyName}.txt`);
  await fs.copyFile(logFilePath, logFileCopyPath);

  return logFileCopyPath;
}
