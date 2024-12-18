export const commands = {
  isGitRepo: "git rev-parse --git-dir",
  clearScreen: process.platform === "win32" ? "cls" : "clear",
  commit: "git commit -m",
  getStashedChanges: "git diff --cached",
};
