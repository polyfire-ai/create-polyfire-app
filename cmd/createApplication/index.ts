import inquirer, { InputQuestion, ListQuestion } from "inquirer";
import { Template, TEMPLATE_DETAILS } from "..";
import {
  cloneRepository,
  createEnvironmentFile,
  cleanOptions,
  installProject,
} from "../utils";

export type CustomQuestion = InputQuestion | ListQuestion;

function mergeAndCleanOptions(
  cliOptions: Record<string, string>,
  userResponses: Record<string, string>
): Record<string, string> {
  const mergedOptions = { ...cliOptions, ...userResponses };
  delete mergedOptions.template;
  return mergedOptions;
}

export default async function createApplication(
  template: Template,
  appName: string,
  cliOptions: Record<string, string>,
  additionalPrompts: CustomQuestion[],
  autoStart?: boolean
): Promise<boolean> {
  const standardPrompts: CustomQuestion[] = [
    {
      type: "input",
      name: "project",
      message:
        "Enter your project alias (obtain one at https://beta.polyfire.com) :",
      when: () => !cliOptions?.project,
    },
  ];

  const allPrompts = [...standardPrompts, ...additionalPrompts];

  try {
    const userResponses = await inquirer.prompt(allPrompts);

    const sanitizedResponses = cleanOptions(userResponses);
    const finalTemplate = template || sanitizedResponses.template;

    if (!finalTemplate || !TEMPLATE_DETAILS[finalTemplate]) {
      throw new Error(`Invalid or missing template: ${finalTemplate}`);
    }

    const finalOptions = mergeAndCleanOptions(cliOptions, sanitizedResponses);
    const templateConfig = TEMPLATE_DETAILS[finalTemplate];

    await cloneRepository(templateConfig.repositoryUrl, appName);
    await createEnvironmentFile(
      appName,
      finalOptions,
      templateConfig.envVariablePrefix
    );

    await installProject(appName, autoStart);

    if (!autoStart) {
      console.info("\nYour project is ready!");
    }
  } catch (error: unknown) {
    console.error(
      "An error occurred:",
      error instanceof Error ? error.message : error
    );
  }

  return true;
}
