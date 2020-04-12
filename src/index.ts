import app from '@server';
import logger from '@shared/Logger';
import { expressConfig } from '@shared/constants';
import { Request, Response } from 'express';
const https = require('https');
const fs = require('fs');


const options = {
    key: fs.readFileSync(__dirname + expressConfig.SSL.keyPath),
    cert: fs.readFileSync(__dirname + expressConfig.SSL.certPath)
};

https.createServer(options, app).listen(expressConfig.SSL.port);


if (expressConfig.shouldOpenHTTPPort) {
    // Start the server
    const port = Number(expressConfig.port || 3000);
    app.listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });

} else {
    logger.warn('HTTPS only mode is activated')
}