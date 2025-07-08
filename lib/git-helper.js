import { spawn } from "child_process";

import { Logger } from "./logger.js";

export class GitHelper {
  async _executeGitCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn("git", [command, ...args], {
        stdio: "pipe",
        cwd: process.cwd(),
        shell: true,
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";

      gitProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      gitProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      gitProcess.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          const errorMessage = stderr.trim() || stdout.trim();
          Logger.error(
            `Git command failed with exit code ${code}: ${errorMessage}`
          );
          reject(new Error(errorMessage));
        }
      });

      gitProcess.on("error", (error) => {
        Logger.error(`Git command encountered an error: ${error.message}`);
        reject(error);
      });
    });
  }

  async checkWorkingDirectory() {
    Logger.info("Checking working directory...");
    const status = await this._executeGitCommand("status", ["--porcelain"]);
    const hasChanges = status.trim().length > 0;
    if (hasChanges) {
      Logger.error("You have uncommitted changes in your working directory.");
      Logger.warn(
        "Please commit or stash your changes before running the release process."
      );
      process.exit(1);
    }
  }

  async getCurrentBranch() {
    return await this._executeGitCommand("branch", ["--show-current"]);
  }

  async commitChanges(env, version) {
    Logger.emptyLine();
    Logger.step(`Starting commit process for ${env} environment...`);

    Logger.info("Adding changes to staging area...");
    await this._executeGitCommand("add", ["-A"]);

    Logger.info(`Committing changes...`);
    const commitMessage = `build(${env}): bump version to ${version}`;
    await this._executeGitCommand("commit", [`-m "${commitMessage}"`]);

    Logger.info("Pushing changes to remote repository...");
    await this._executeGitCommand("push");
  }

  async mergeBranch(currentBranch, targetBranch) {
    Logger.emptyLine();
    Logger.step(`Merging changes from ${currentBranch} to ${targetBranch}...`);

    Logger.info(`Git checkout to branch ${targetBranch}...`);
    await this._executeGitCommand("checkout", [targetBranch]);

    Logger.info(`Merging changes...`);
    await this._executeGitCommand("pull", ["origin", targetBranch]);
    await this._executeGitCommand("merge", [currentBranch]);

    Logger.info(`Pushing changes to remote branch ${targetBranch}...`);
    await this._executeGitCommand("push", ["origin", targetBranch]);

    Logger.info(`Returning to branch ${currentBranch}...`);
    await this._executeGitCommand("checkout", [currentBranch]);
  }
}
