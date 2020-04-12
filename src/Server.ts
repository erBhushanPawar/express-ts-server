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

const fileUpload = require('express-fileupload');

class ExpressServer {
    // Init express
    app: any;
    jsonServer: any;
    constructor() {
        this.app = express();
        const bodyParser = require('body-parser');

        this.app.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        }));
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json())
        this.app.use(express.static(path.join(__dirname, 'public')));

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
        this.app.post('/upload', function (req: any, res: Response) {
            if (!req.files)
                return res.status(400).send('No files were uploaded.');

            console.log(req.files); // the uploaded file object
            res.json({ files: req.files.foo })
        });
        this.app.use('/api', BaseRouter);
        this.app.use('/mw', middlewareHandler.router);

    }

    mountStaticDeployments() {
        expressConfig.staticDeployments.forEach((d: any) => {
            if (d.shouldDeploy) {

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
