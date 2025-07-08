const SYMBOLS = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
  step: "➡️",
};

export class Logger {
  static log(message, indent = "") {
    console.log(`${indent}${message}`);
  }

  static info(message) {
    console.log(`${SYMBOLS.info}  ${message}`);
  }

  static success(message) {
    console.log(`${SYMBOLS.success}  ${message}`);
  }

  static warn(message) {
    console.log(`${SYMBOLS.warning}  ${message}`);
  }

  static error(message) {
    console.log(`${SYMBOLS.error}  ${message}`);
  }

  static step(message) {
    console.log(`${SYMBOLS.step}  ${message}`);
  }

  static separator(char = "=", length = 60) {
    console.log(char.repeat(length));
  }

  static emptyLine() {
    console.log("");
  }
}
