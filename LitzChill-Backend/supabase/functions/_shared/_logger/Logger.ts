/**
 * Logger class to handle logging messages with additional information like timestamp and caller location.
 */
export class Logger {
    private static instance: Logger;

    private constructor() {}

    /**
     * Returns a singleton instance of the Logger class.
     * If the instance does not exist, a new instance will be created.
     * 
     * @returns {Logger} The Logger instance.
     */
    public static getloggerInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Retrieves the caller's location from the stack trace.
     * The stack trace provides information such as the file path and line number of the code execution.
     * 
     * @returns {string} The caller location or "Unknown location" if it cannot be determined.
     */
    private getCallerLocation() {
        const stack = new Error().stack;
        if (stack) {
            const stackLines = stack.split("\n");
            const callerInfo = stackLines[3].trim();
            return callerInfo;
        }
        return "Unknown location";
    }

    /**
     * Logs a general message with the timestamp and caller location.
     * 
     * @param {string} message The message to log.
     */
    log(message: string) {
        const callerLocation = this.getCallerLocation();
        console.log(`[${new Date().toISOString()}] ${callerLocation} - ${message}`);
    }

    /**
     * Logs an informational message with the caller location.
     * 
     * @param {string} message The informational message to log.
     */
    info(message: string) {
        const callerLocation = this.getCallerLocation();
        console.log("caller location ",callerLocation);
        console.info(`[INFO] ${callerLocation}: ${message}`);
    }

    /**
     * Logs a warning message with the caller location.
     * 
     * @param {string} message The warning message to log.
     */
    warn(message: string) {
        const callerLocation = this.getCallerLocation();
        console.warn(`[WARN] ${callerLocation}: ${message}`);
    }

    /**
     * Logs an error message with the caller location.
     * 
     * @param {string} message The error message to log.
     */
    error(message: string) {
        const callerLocation = this.getCallerLocation();
        console.error(`[ERROR] ${callerLocation}: ${message}`);
    }
}
