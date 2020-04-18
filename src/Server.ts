import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { Request, Response, NextFunction } from 'express';

import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
import { expressConfig } from '@shared/constants';
import middlewareHandler from '@shared/middleware-handler';
import fileHandler from '@shared/file-handler';
import imageHandler from '@shared/image-handler';
import videoHandler from '@shared/video-handler';



class ExpressServer {
    // Init express
    app: any;
    jsonServer: any;
    constructor() {
        this.app = express();
        this.initServer();
        this.mountRouters();
        if (expressConfig.deploymentTypes.static) {
            this.mountStaticDeployments();
        } else {
            logger.warn('static deployments are disabled by the flag, so not hosting')
        }

        if (expressConfig.deploymentTypes.json) {
            this.jsonServer = require('json-server')
            this.mountJSONDeployments();
        } else {
            logger.warn('json deployments are disabled by the flag, so not hosting')
        }
    }

    initServer() {

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        const bodyParser = require('body-parser');

        const fileUpload = require('express-fileupload');
        this.app.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        }));
        this.app.use(bodyParser.urlencoded({ extended: false }))

        this.applyEnvChanges();

        // Print API errors
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        });

    }

    applyEnvChanges() {

        // Show routes called in console during development
        if (expressConfig.env === 'development') {
            this.app.use(morgan('dev'));
        }

        // Security
        if (expressConfig.env === 'production') {
            this.app.use(helmet());
        }

    }

    mountRouters() {

        this.app.use('/api', BaseRouter);
        this.app.use('/mw', middlewareHandler.router);
        this.app.use('/file-server', fileHandler);
        this.app.use('/image-server', imageHandler);
        this.app.use('/video-server', videoHandler);
    }


    prepareFileUpload() {

    }

    mountStaticDeployments() {
        expressConfig.staticDeployments.forEach((d: any) => {
            if (d.shouldDeploy) {
                logger.info(`deploying the ${d.context} using directory ${__dirname + d.directory}`)
                this.app.use(d.context, express.static(__dirname + d.directory))
            }
        });
    }
    mountJSONDeployments() {
        expressConfig.jsonDeployments.forEach((d: any) => {
            if (d.shouldDeploy) {
                this.app.use(
                    d.context,
                    this.jsonServer.defaults(d.config),
                    this.jsonServer.router(
                        path.join(__dirname, d.directory)
                    )
                )
            }
        })
    }
}

export default new ExpressServer().app;
