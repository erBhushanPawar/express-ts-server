import { Router, Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
class FileHandler {

    router: Router;
    fileUploadDirectories = {
        publicPath: __dirname + '/../../deployments/static/image-server/',
        httpUrl: 'http://localhost:3001/static/image-server/',
        httpsUrl: 'https://localhost:3002/static/image-server/',
        addTimeStampInFile: true
    }
    constructor() {
        this.router = Router();
        this.mountEndpoints();
    }
    mountEndpoints() {
        this.router.post('/upload', (req: any, res: Response) => {
            if (!req.files) {
                return res.status(BAD_REQUEST).json({
                    error: 'No files are uploaded'
                })
            }

            console.log(req.files)
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            let profilePic = req.files.profilePic;
            profilePic.name = profilePic.name.replace(/ /g, '-').toLowerCase();

            if (this.fileUploadDirectories.addTimeStampInFile) {
                const arr = profilePic.name.split('.');
                const extension = arr.pop();

                profilePic.name = arr.join('.') + new Date().getTime() + '.' + extension
            }


            // Use the mv() method to place the file somewhere on your server
            const fileUploaderConfig = {
                path: this.fileUploadDirectories.publicPath + '/' + profilePic.name,
                httpUrl: this.fileUploadDirectories.httpUrl + '/' + profilePic.name,
                httpsURL: this.fileUploadDirectories.httpsUrl + '/' + profilePic.name,
            }
            profilePic.mv(
                fileUploaderConfig.path,
                (err: any) => {
                    if (err)
                        return res.status(500).send(err);

                    res.json(fileUploaderConfig);
                });

        })
    }

}


export default new FileHandler().router;