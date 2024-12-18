# AI Commit Message Generator

AI Commit Message Generator is a tool that uses an AI model to generate commit messages based on the staged changes in your Git repository. It leverages the Ollama model to create concise, informative commit messages that follow best practices in version control.
<img width="1035" alt="image" src="https://github.com/user-attachments/assets/116590cd-b1fc-4f89-b8b0-fcc31b4acd1a" />

## Features

- Generates commit messages using the Ollama AI model
- Supports various commit message types (feat, fix, refactor, etc.)
- Provides a detailed explanation of changes in bullet points
- Focuses on major changes and uses technical, precise language
- Interactive prompt to proceed with the commit, regenerate the message, or discard it

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/ssk090/ai-commit-gen.git
   cd ai-commit-gen
2. Install the dependencies:
   ```sh
   npm install

## Usage
1. Ensure you have staged changes in your Git repository:
   ```sh
   git add .
2. Run the AI Commit Message Generator:
   ```sh
   node index.js
3. Follow the interactive prompt to proceed with the commit, regenerate the message, or discard it.
   ```sh
   ✨ Generating commit message...
    --------------------------------------------------

    feat(package.json): update package.json with ai-commit-gen information
    - added new package name and version
    - updated scripts to include test command
    - set author and license details 
    - impact: enables accurate dependency tracking for ai-commit-gen project

    Proceed to commit? [y(yes) | n(no) | r(regenerate)] ›
4. Choose an action:
- `y` or `yes`: Proceed with the commit
- `n` or `no`: Discard the AI-generated commit message
- `r` or `regenerate`: Regenerate the commit message


## Configuration
- The tool uses the following configuration files:
- `commands.js`: Defines the shell commands used by the tool.
- `systemPrompt.js`: Contains the system prompt used by the AI model to generate commit messages.
