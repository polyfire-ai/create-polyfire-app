import { program } from "commander";
import inquirer from "inquirer";
import createApplication, { CustomQuestion } from "./createApplication";

enum ProjectType {
  CHAT = "chat",
  AGENT = "agent",
}

type TemplateName = `${
  | ProjectType.CHAT
  | ProjectType.AGENT}-${string}${string}`;

const CHAT_REACT_VITE_TS: TemplateName = "chat-react-vite-ts";
const CHAT_REACT_VITE_JS: TemplateName = "chat-react-vite-js";

const CHAT_REACT_JS: TemplateName = "chat-react-js";
const CHAT_REACT_TS: TemplateName = "chat-react-ts";

const CHAT_NEXT_TS: TemplateName = "chat-next-ts";
const CHAT_NEXT_JS: TemplateName = "chat-next-js";

const AGENT_REACT_TS: TemplateName = "agent-react-ts";
const AGENT_REACT_JS: TemplateName = "agent-react-js";

const knownTemplates: TemplateName[] = [
  CHAT_REACT_VITE_TS,
  CHAT_REACT_VITE_JS,
  CHAT_REACT_TS,
  CHAT_REACT_JS,
  CHAT_NEXT_TS,
  CHAT_NEXT_JS,
  AGENT_REACT_TS,
  AGENT_REACT_JS,
];

export type Template = (typeof knownTemplates)[number];

type TemplateDetails = {
  repositoryUrl: string;
  envVariablePrefix: string;
};

const CREATE_CHATBOT = "Create chatbot";
const CREATE_AGENT = "Create agent";

export const TEMPLATE_DETAILS: Record<Template, TemplateDetails> = {
  // Chat templates
  [CHAT_REACT_VITE_TS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-chat-react-vite-ts-boilerplate.git",
    envVariablePrefix: "VITE_",
  },
  [CHAT_REACT_VITE_JS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-chat-react-vite-js-boilerplate.git",
    envVariablePrefix: "VITE_",
  },
  [CHAT_REACT_TS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-chat-react-ts-boilerplate.git",
    envVariablePrefix: "REACT_APP_",
  },
  [CHAT_REACT_JS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-chat-react-js-boilerplate.git",
    envVariablePrefix: "REACT_APP_",
  },
  [CHAT_NEXT_TS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-chat-next-ts-boilerplate.git",
    envVariablePrefix: "NEXT_PUBLIC_",
  },
  [CHAT_NEXT_JS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-chat-next-js-boilerplate.git",
    envVariablePrefix: "NEXT_PUBLIC_",
  },
  // Agent templates
  [AGENT_REACT_TS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-agent-react-ts-boilerplate.git",
    envVariablePrefix: "REACT_APP_",
  },
  [AGENT_REACT_JS]: {
    repositoryUrl:
      "https://github.com/polyfire-ai/polyfire-agent-react-js-boilerplate.git",
    envVariablePrefix: "REACT_APP_",
  },
};

const questions = (
  options: Record<string, string>,
  template?: string
): Record<string, CustomQuestion[]> => ({
  chat: [
    {
      type: "input",
      name: "botname",
      message: "Enter the name of the bot",
      default: "polyfire-bot",
      when: () => !options?.botname,
    },
    {
      type: "list",
      name: "template",
      message: "Choose a template",
      choices: knownTemplates.filter((t) => t.startsWith(ProjectType.CHAT)),
      when: () => !template,
    },
  ],
  agent: [
    {
      type: "list",
      name: "template",
      message: "Choose a template",
      choices: knownTemplates.filter((t) => t.startsWith(ProjectType.AGENT)),
      when: () => !template,
    },
  ],
});

async function handleCommand({
  appName,
  autoStart,
  template,
  ...options
}: {
  appName: string;
  autoStart: boolean;
  template?: Template;
  botname?: string;
  project?: string;
}): Promise<void> {
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to build?",
      choices: [CREATE_CHATBOT, CREATE_AGENT, "Quit"],
      when: () => !template,
    },
  ]);

  if (template && !knownTemplates.includes(template)) {
    console.error(`Unknown template: ${template}`);
    return;
  } else if (!template && !answer.action) {
    console.error("No template selected");
    return;
  }

  let actionType: string = answer.action;

  if (template) {
    if (template.startsWith(ProjectType.CHAT)) {
      actionType = ProjectType.CHAT;
    } else if (template.startsWith(ProjectType.AGENT)) {
      actionType = ProjectType.AGENT;
    }
  } else if (answer.action === CREATE_CHATBOT) {
    actionType = ProjectType.CHAT;
  } else if (answer.action === CREATE_AGENT) {
    actionType = ProjectType.AGENT;
  }

  const additionalQuestions = questions(options, template)[actionType];

  switch (actionType) {
    case ProjectType.CHAT:
    case ProjectType.AGENT:
      await createApplication(
        template as Template,
        appName,
        options,
        additionalQuestions,
        autoStart
      );
      break;
    case "Quit":
      console.info("Bye!");
      return;
    default:
      console.error("Invalid choice");
      break;
  }
}

function displayHelpMessage() {
  console.info("Please specify the project directory:");
  console.info("  create-polyfire-app <project-directory>\n");
  console.info("For example:");
  console.info("  create-polyfire-app my-polyfire-app\n");
  console.info("Run 'create-polyfire-app --help' to see all options.");
}

function groupTemplatesByType(templates: TemplateName[]) {
  return templates.reduce<Record<string, TemplateName[]>>(
    (groupedTemplates, template) => {
      const [type] = template.split("-");
      if (!groupedTemplates[type]) {
        groupedTemplates[type] = [];
      }
      groupedTemplates[type].push(template);
      return groupedTemplates;
    },
    {}
  );
}

function displayGroupedTemplates(
  groupedTemplates: Record<string, TemplateName[]>
) {
  Object.entries(groupedTemplates).forEach(([type, templates]) => {
    console.info(`${type.toUpperCase()}:\n`);
    templates.forEach((template, index) => {
      console.info(`  ${index + 1}. ${template}`);
    });
    console.info("\n");
  });
}

function configureCLI() {
  program
    .name("create-polyfire-app")
    .description("A tool to create new applications with specified templates.")
    .argument("<app-name>", "The name of the new application")
    .option(
      "--template <template>",
      "Template to use (use --list to see available templates)"
    )
    .option("--project <project>", "The project name")
    .option(
      "--botname <botname>",
      "The name of the bot (only for chat templates)"
    )
    .option("--auto-start", "Auto start the application after creation")
    .action((appName, options) => {
      const autoStart = options.autoStart || false;

      handleCommand({ appName, autoStart, ...options });
    });

  program
    .command("list")
    .description("List all available templates")
    .action(() => {
      console.info("Available templates:\n");
      const groupedTemplates = groupTemplatesByType(knownTemplates);
      displayGroupedTemplates(groupedTemplates);
      console.info(
        "Use 'create-polyfire-app <app-name> --template <template-name>' to create a new application."
      );
    });
}

function main() {
  if (process.argv.length <= 2) {
    displayHelpMessage();
  } else {
    configureCLI();
    program.parse(process.argv);
  }
}

main();
