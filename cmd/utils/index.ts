import path from "path";
import fs from "fs/promises";

import { spawn } from "child_process";

function addUnderscoreBeforeCapitalLetters(str: string): string {
  return str.replace(/([A-Z])/g, (match, offset) =>
    offset > 0 ? `_${match}` : match
  );
}

export async function createEnvironmentFile(
  repo: string,
  options: Record<string, string>,
  prefix: string
): Promise<void> {
  const filename = ".env";
  const filePath = path.join(repo, filename);

  let envContent = "";

  try {
    for (const [key, value] of Object.entries(options)) {
      if (value) {
        const envVariableName = `${prefix}POLYFIRE_${addUnderscoreBeforeCapitalLetters(
          key
        ).toUpperCase()}`;
        envContent += `${envVariableName}=${value}\n`;
      }
    }

    await fs.writeFile(filePath, envContent.trim(), "utf8");
  } catch (error) {
    console.error("Error writing environment file:", error);
    throw error;
  }
}

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

export function cleanOptions(
  options: Record<string, string>
): Record<string, string> {
  const keysToSkip = ["stack"];
  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => [
      key,
      keysToSkip.includes(key) || typeof value !== "string"
        ? value
        : sanitizeInput(value),
    ])
  );
}

async function executeCommandWithRealtimeOutput(
  command: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, FORCE_COLOR: "true" },
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

export async function executeCommand(
  command: string,
  fallbackCommand: string | null = null,
  messageError = "Error executing command"
): Promise<void> {
  try {
    await executeCommandWithRealtimeOutput(command);
  } catch (error) {
    console.error(`${messageError}: ${error}`);
    if (fallbackCommand) {
      try {
        await executeCommandWithRealtimeOutput(fallbackCommand);
      } catch (fallbackError) {
        throw new Error(`Error executing fallback command: ${fallbackError}`);
      }
    } else {
      throw error;
    }
  }
}

export async function installProject(
  appName: string,
  autoStart?: boolean
): Promise<void> {
  let command = `cd ${appName} && npm install`;
  let fallbackCommand = null;

  if (autoStart) {
    command += " && npm run dev";
    fallbackCommand = `cd ${appName} && npm start`;
  }

  return executeCommand(command, fallbackCommand, "Error installing project");
}

export async function cloneRepository(
  repoURL: string,
  repo: string
): Promise<void> {
  if (
    await fs.access(repo).then(
      () => true,
      () => false
    )
  ) {
    console.info("Repository already exists. No action taken.");
    process.exit(0);
  }

  return executeCommand(
    `git clone ${repoURL} ${repo}`,
    null,
    "Error cloning repository"
  );
}
