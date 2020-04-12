/**
 * Setup the winston logger.
 *
 * Documentation: https://github.com/winstonjs/winston
 */

import { createLogger, format, transports } from 'winston';
import { expressConfig } from './constants';

// Import Functions
const { File, Console } = transports;

// Init Logger
const logger = createLogger({
    level: expressConfig.loggerConfig.level,
});

/**
 * For production write to all logs with level `info` and below
 * to `combined.log. Write all logs error (and below) to `error.log`.
 * For development, print to the console.
 */
if (expressConfig.env === 'production') {

    const fileFormat = format.combine(
        format.timestamp(),
        format.json(),
    );
    const errTransport = new File({
        filename: expressConfig.loggerConfig.errorLogFile,
        format: fileFormat,
        level: 'error',
    });
    const infoTransport = new File({
        filename: expressConfig.loggerConfig.combinedLogFile,
        format: fileFormat,
    });
    logger.add(errTransport);
    logger.add(infoTransport);

} else {

    const errorStackFormat = format((info) => {
        if (info.stack) {
            // tslint:disable-next-line:no-console
            console.log(info.stack);
            return false;
        }
        return info;
    });
    const consoleTransport = new Console({
        format: format.combine(
            format.colorize(),
            format.simple(),
            errorStackFormat(),
        ),
    });
    logger.add(consoleTransport);
}

export default logger;