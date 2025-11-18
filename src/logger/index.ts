/**
 * Professional Logger for LINE Plugin
 */
export class LineLogger {
  private enabled: boolean;
  private readonly colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  };
  private maxDataLength: number = 5000; // Max length for stringified data before truncation

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: string, color: string, message: string): string {
    if (process.stdout.isTTY) {
      return `${this.colors.dim}[${this.getTimestamp()}]${this.colors.reset} ${color}[${level}]${this.colors.reset} ${this.colors.cyan}[LINE]${this.colors.reset} ${message}`;
    }
    return `[${this.getTimestamp()}] [${level}] [LINE] ${message}`;
  }

  info(message: string, data?: any): void {
    if (!this.enabled) return;
    console.log(this.formatLog("INFO", this.colors.blue, message));
    if (data) this.logData(data);
  }

  success(message: string, data?: any): void {
    if (!this.enabled) return;
    console.log(this.formatLog("SUCCESS", this.colors.green, message));
    if (data) this.logData(data);
  }

  warn(message: string, data?: any): void {
    if (!this.enabled) return;
    console.warn(this.formatLog("WARN", this.colors.yellow, message));
    if (data) this.logData(data);
  }

  error(message: string, error?: any): void {
    if (!this.enabled) return;
    console.error(this.formatLog("ERROR", this.colors.red, message));
    if (error) {
      if (error instanceof Error) {
        console.error(
          `  ${this.colors.red}├─${this.colors.reset} ${error.message}`
        );
        if (error.stack) {
          const stackLines = error.stack.split("\n").slice(1, 4);
          stackLines.forEach((line, i) => {
            const prefix = i === stackLines.length - 1 ? "└─" : "├─";
            console.error(
              `  ${this.colors.dim}${prefix}${this.colors.reset} ${line.trim()}`
            );
          });
        }
      } else {
        this.logData(error);
      }
    }
  }

  debug(message: string, data?: any): void {
    if (!this.enabled) return;
    console.log(this.formatLog("DEBUG", this.colors.magenta, message));
    if (data) this.logData(data);
  }

  private logData(data: any): void {
    if (!this.enabled) return;

    let stringified = JSON.stringify(data, null, 2);

    if (stringified.length > this.maxDataLength) {
      stringified = stringified.substring(0, this.maxDataLength) + "\n... (truncated)";
    }

    const lines = stringified.split("\n");

    lines.forEach((line, index) => {
      const isLast = index === lines.length - 1;
      const prefix = isLast ? "  └─" : "  ├─";
      console.log(`${this.colors.dim}${prefix}${this.colors.reset} ${line}`);
    });
  }

  divider(): void {
    if (!this.enabled) return;
    console.log(`${this.colors.dim}${"─".repeat(80)}${this.colors.reset}`);
  }

  section(title: string): void {
    if (!this.enabled) return;
    console.log(
      `\n${this.colors.bright}${this.colors.cyan}━━━ ${title} ━━━${this.colors.reset}`
    );
  }
}
