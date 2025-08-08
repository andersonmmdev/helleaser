import { Logger } from "./logger.js";

const ARGS_HELPER = {
  "--merge": "Branch target to merge after generate new release",
  "--build":
    "Custom build command to run before release, defaults to 'npm run build'",
  "--staging -s": "Use staging environment, otherwise production",
  "--skip-version -sv":
    "Do not generate a new version, will use current package.json version",
  "--no-tag -nt": "Do not generate a tag, only push the commit",
  "--help -h": "Display help information",
  "--version -v": "Display the current cli version",
};

export class ArgumentsParser {
  constructor() {
    this.parsedArgs = {};
  }

  _displayHelp() {
    Logger.emptyLine();
    Logger.separator();
    Logger.log("Helleaser CLI - Arguments available", "  ");
    Logger.separator();
    Logger.emptyLine();
    for (const [arg, description] of Object.entries(ARGS_HELPER)) {
      Logger.log(`  ${arg}: ${description}`);
    }
    process.exit(0);
  }

  _displayVersion() {
    Logger.log("v1.0.0");
    process.exit(0);
  }

  parse() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      return this.parsedArgs;
    }

    if (args.includes("--help") || args.includes("-h")) {
      this._displayHelp();
    }

    if (args.includes("--version") || args.includes("-v")) {
      this._displayVersion();
    }

    for (let i = 0; i < args.length; i++) {
      const key = args[i];
      if (key.startsWith("--")) {
        const formattedKey = key.replace(/^-+/, "");
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith("--")) {
          this.parsedArgs[formattedKey] = nextArg;
          i++;
        } else {
          this.parsedArgs[formattedKey] = true;
        }
      } else if (key.startsWith("-")) {
        const formattedKey = key.replace(/^-+/, "");
        this.parsedArgs[formattedKey] = true;
      }
    }

    return this.parsedArgs;
  }

  getEnvironment() {
    return this.parsedArgs["staging"] || this.parsedArgs["s"]
      ? "staging"
      : "production";
  }

  get(key) {
    return this.parsedArgs[key] || false;
  }
}
