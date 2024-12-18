import { exec } from "child_process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import ollama from "ollama";
import prompts from "prompts";
import { systemPrompt } from "./systemPrompt.js";
import { commands } from "./commands.js";

const args = yargs(hideBin(process.argv)).option("debug", {
  alias: "d",
  type: "boolean",
  description: "Run with debug output",
}).argv;

/**
 * Executes a shell command and returns the result as a Promise.
 * @param {string} command - The command to run.
 * @param {string[]} [extraArgs=[]] - Additional arguments for the command.
 * @returns {Promise<string>} - The result of the command.
 */
function runCommand(command, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const shellCommand = Array.isArray(command) ? command : command.split(" ");
    const fullCommand = [...shellCommand, ...extraArgs].join(" ");
    if (args.debug) {
      console.log("-".repeat(50));
      console.log(`⚡️ Running command: ${fullCommand}`);
      console.log("-".repeat(50));
    }
    exec(fullCommand, { encoding: "utf-8" }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error running command: ${stderr}`);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Generates a commit message using the local AI model.
 * @param {string} stagedChanges - The staged changes to generate the commit message for.
 * @returns {Promise<string>} - The generated commit message.
 */
async function generateCommitMessageLocalModel(stagedChanges) {
  const modelName = "llama3.2:3b";
  if (args.debug) {
    console.log(`>>> Using Ollama with ${modelName}`);
  }

  try {
    const stream = await ollama.chat({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here are the staged changes '''${stagedChanges}'''`,
        },
      ],
      stream: true,
    });

    console.log("✨ Generating commit message...");
    console.log("-".repeat(50) + "\n");
    let commitMessage = "";
    for await (const part of stream) {
      process.stdout.write(part.message.content);
      commitMessage += part.message.content;
    }
    console.log();
    return commitMessage;
  } catch (error) {
    console.error(`❌ Error generating commit message: ${error.message}`);
    throw error;
  }
}

/**
 * Handles the user interaction loop for committing changes.
 * @param {string} stagedChanges - The staged changes to generate the commit message for.
 */
async function interactionLoop(stagedChanges) {
  while (true) {
    try {
      const commitMessage = await generateCommitMessageLocalModel(
        stagedChanges
      );
      const response = await prompts({
        type: "text",
        name: "action",
        message: "\n\nProceed to commit? [y(yes) | n(no) | r(regenerate)]",
      });

      switch (response.action) {
        case "r":
        case "regenerate":
          const clearScreen = await runCommand(commands["clearScreen"]);
          console.log(`${clearScreen}`);
          continue;
        case "y":
        case "yes":
          console.log("committing...");
          const res = await runCommand(`${commands.commit} "${commitMessage}"`);
          console.log(`\n${res}\n✨ Committed!`);
          break;
        case "n":
        case "no":
          console.log("\n❌ Discarding AI commit message.");
          break;
        default:
          console.log("\n🤖 Invalid action");
          break;
      }
      break;
    } catch (error) {
      console.error(`❌ Error during interaction loop: ${error.message}`);
      break;
    }
  }
}

/**
 * Main function to run the AI commit generator.
 */
async function run() {
  try {
    const isGitRepo = await runCommand(commands.isGitRepo);
    if (!isGitRepo) {
      console.log("\n\n🐙 Not a git repo.");
      return;
    }

    const stagedChanges = await runCommand(commands.getStashedChanges);
    if (args.debug) {
      console.log(stagedChanges);
      console.log("-".repeat(50));
    }
    if (!stagedChanges) {
      console.log("\n🗂️ No staged changes");
      return;
    }

    await interactionLoop(stagedChanges);
  } catch (error) {
    if (error instanceof Error && error.message.includes("SIGINT")) {
      console.log("\n\n❌ AI commit exited.");
    } else {
      console.error(`❌ Unexpected error: ${error.message}`);
    }
  }
}

run();
