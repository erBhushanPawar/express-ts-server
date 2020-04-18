import { Router, Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
const Jimp = require('jimp');

class ImageHandler {

    router: Router;
    fileUploadDirectories = {
        publicPath: __dirname + '/../../deployments/static/image-server/',
        tempPath: __dirname + '/../../deployments/static/image-server/temp/',
        httpUrl: 'http://localhost:3001/static/image-server/temp/',
        httpsUrl: 'https://localhost:3002/static/image-server/temp/',
        addTimeStampInFile: true
    }
    constructor() {
        this.router = Router();
        this.mountEndpoints();
    }
    mountEndpoints() {
        this.router.get('/transform/:fileName/:expectedHeight/:expectedWidth', (req: any, res: Response) => {

            Jimp.read(this.fileUploadDirectories.publicPath + req.params.fileName, (err: any, image: any) => {
                if (err) throw err;
                const imageProcessorConfig = {
                    path: this.fileUploadDirectories.tempPath + '/' + req.params.fileName,
                    httpUrl: this.fileUploadDirectories.httpUrl + '/' + req.params.fileName,
                    httpsURL: this.fileUploadDirectories.httpsUrl + '/' + req.params.fileName,

                    height: Number(req.params.expectedHeight),
                    width: Number(req.params.expectedWidth)
                }
                image
                    .resize(imageProcessorConfig.height, imageProcessorConfig.width) // resize
                    .quality(100) // set JPEG quality
                    .greyscale() // set greyscale
                    .write(imageProcessorConfig.path, (r: any) => {
                        res.json(imageProcessorConfig)
                    }); // save
            });
            // if (this.fileUploadDirectories.addTimeStampInFile) {
            //     const arr = profilePic.name.split('.');
            //     const extension = arr.pop();

            //     profilePic.name = arr.join('.') + new Date().getTime() + '.' + extension
            // }


            // Use the mv() method to place the file somewhere on your server

        })
    }

}


export default new ImageHandler().router;