import fs from "fs";
import path from "path";
import readline from "readline";
import { spawn } from "child_process";

import { ArgumentsParser } from "./arguments-parser.js";
import { GitHelper } from "./git-helper.js";
import { Logger } from "./logger.js";

export class Cli {
  constructor() {
    this.argsParser = new ArgumentsParser();
    this.gitHelper = new GitHelper();
    this.mergingBranch = null;
  }

  async _processNewVersion(env) {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    const currentVersion = packageJson.version;

    Logger.emptyLine();
    Logger.info(`Current version: ${currentVersion}`);
    Logger.step("Choose a new version for the release:");
    const newVersions = this._generateNewVersions(currentVersion);
    Logger.log("1. Patch: " + newVersions[0] + " [default]", "     ");
    Logger.log("2. Minor: " + newVersions[1], "     ");
    Logger.log("3. Major: " + newVersions[2], "     ");

    const choice = await new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question("    Choose an option (1-3): ", (answer) => {
        rl.close();
        resolve(answer);
      });
    });

    const option = choice.trim() || "1";
    const newVersion = newVersions[parseInt(option) - 1 || 0];
    if (!newVersion) {
      Logger.error("Invalid option selected. Please choose a valid option.");
      process.exit(1);
    }

    Logger.info(`Updating version from ${currentVersion} to ${newVersion}`);
    packageJson.version = newVersion;
    const lineEnding = this.isWindows ? "\r\n" : "\n";
    const jsonContent = JSON.stringify(packageJson, null, 2);
    fs.writeFileSync(packageJsonPath, jsonContent + lineEnding);

    await this._buildProject();

    const currentBranch = await this.gitHelper.getCurrentBranch();
    if (currentBranch) {
      await this.gitHelper.commitChanges(env, newVersion);
      if (this.mergingBranch) {
        await this.gitHelper.mergeBranch(currentBranch, this.mergingBranch);
      }
    }

    Logger.emptyLine();
    Logger.success(`Completed the release process for version ${newVersion}`);
  }

  _generateNewVersions(currentVersion) {
    const versionParts = currentVersion.split(".");
    if (versionParts.length !== 3) {
      Logger.error("Invalid version format. Expected format: x.y.z");
      process.exit(1);
    }

    return [
      `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`,
      `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`,
      `${parseInt(versionParts[0]) + 1}.0.0`,
    ];
  }

  _buildProject() {
    Logger.emptyLine();
    Logger.step("Building the project...");
    const buildCommand = this.argsParser.get("build") || "build";
    return new Promise((resolve, reject) => {
      const npmProcess = spawn("npm", ["run", buildCommand], {
        stdio: "inherit",
        cwd: process.cwd(),
        shell: true,
      });

      npmProcess.on("close", (code) => {
        if (code === 0) {
          Logger.success("Build process completed successfully.");
          resolve();
        } else {
          Logger.error(`Build process failed with exit code ${code}`);
          reject(new Error(`Build process failed with exit code ${code}`));
        }
      });

      npmProcess.on("error", (error) => {
        Logger.error(`Build process encountered an error: ${error.message}`);
        reject(error);
      });
    });
  }

  async _processStaging() {
    Logger.emptyLine();
    Logger.info("Running for staging environment...");
    if (this.mergingBranch) {
      Logger.info(
        `Automatically merging changes into branch: ${this.mergingBranch}`
      );
    }
    this._processNewVersion("staging");
  }

  async run() {
    await this.gitHelper.checkWorkingDirectory();

    this.argsParser.parse();
    const env = this.argsParser.getEnvironment();
    this.mergingBranch = this.argsParser.get("merge");

    if (env === "production") {
      Logger.warn("Production environment is not supported yet.");
      process.exit(0);
    } else if (env === "staging") {
      await this._processStaging();
    } else {
      Logger.error(
        "Invalid environment specified. For more information, use --help."
      );
      process.exit(1);
    }
  }
}
