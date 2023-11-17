# README for `create-polyfire-app`

## Overview

`create-polyfire-app` is a TypeScript-based CLI tool designed to streamline the process of creating new chatbot or agent applications. It offers a choice of templates and custom configurations, facilitating rapid setup and deployment.

## Commands and Options

### Main Command

- **Command:** `create-polyfire-app <app-name>`
  - **Description:** Initializes a new application with the specified name.
  - **Arguments:**
    - `<app-name>`: Name of the new application.

### Options

- **`--template <template>`**: Specifies the template to use for the project. Available templates can be listed using the `list` command.
- **`--project <project>`**: Your project alias (get one on app.polyfire.com).
- **`--botname <botname>`**: Names the bot (applicable only for chat templates).

### Additional Commands

- **Command:** `create-polyfire-app list`
  - **Description:** Lists all available templates.

## Usage

### Interactive Mode

1. Run `create-polyfire-app <app-name>` without any options.
2. Follow the interactive prompts to configure your application.

### Command Line Arguments

1. Run `create-polyfire-app <app-name>` with desired options.
   - Example: `create-polyfire-app my-chatbot --template chat-react-vite --botname myBot`

## Additional Features

### Environment File Creation

Automatically generates an `.env` file based on selected options, ensuring proper environment setup for your application.

## Dependencies

- **Commander**: For parsing command-line arguments.
- **Inquirer**: For interactive command-line interfaces.
- **File System Operations**: For handling file creation and repository cloning.
