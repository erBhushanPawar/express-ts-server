import { expressConfig } from "./constants";
import { Router, Request, Response } from 'express';

const request = require('request');

class MiddlewareHandler {
    router: Router;
    serverIdentify: any;
    constructor() {
        this.serverIdentify = expressConfig.serverIdentify;
        this.router = Router();
        this.mountEndpoints();
    }
    mountEndpoints() {
        this.router.all('*', (req: Request, res: Response) => {
            const prefix = req.url.split('/')[1]
            const middlewareConfig = expressConfig.middlewareDeployments.filter((x: any) => x.contextPrefix === prefix)[0]
            console.log(prefix, middlewareConfig)
            if (!middlewareConfig) {
                res.json({
                    error: 'Unknown deployment'
                })
                return;
            }

            if (!middlewareConfig.shouldDeploy) {
                res.json({
                    error: 'This is undeployed URL'
                })
                return;
            }
            if (middlewareConfig.allowedMethods.indexOf(req.method) === -1) {
                res.json({
                    error: 'This method is not allowed on this middleware URL'
                })
                return;
            }
            const options = {
                method: req.method,
                url: middlewareConfig.serverURL + req.url,
                headers: {
                    'Accept': 'application/json',
                    ...this.serverIdentify
                }
            }


            request(options, (err: any, response: any, body: any) => {


                body = this.processRequest(body);
                res.json(body);

            })

        })
    }


    processRequest(body: any) {
        try {
            body = JSON.parse(body)
        } catch (error) {

        }
        return body;
    }

}

export default new MiddlewareHandler();