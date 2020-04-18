import { Router, Request, Response } from 'express';
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from 'http-status-codes';

const axios = require('axios')
class VideoHandler {

    router: Router;
    videoList = [
        {
            videoHash: '123',
            videoLink: 'http://mirrors.standaloneinstaller.com/video-sample/Catherine_Part1.mkv',
            isProtected: true
        },
        {
            videoHash: '12345',
            videoLink: 'http://mirrors.standaloneinstaller.com/video-sample/page18-movie-4.mkv',
            isProtected: true
        }
    ]
    constructor() {
        this.router = Router();
        this.mountEndpoints();
    }
    mountEndpoints() {

        this.router.get('/stream', (req: Request, res: Response) => {


            if (!req.query.v) {
                return res.status(BAD_REQUEST).json({
                    error: 'No video specified'
                })
            }


            const videoToStream = this.videoList.filter(x => x.videoHash == req.query.v)[0]

            if (!videoToStream) {
                return res.status(NOT_FOUND).json({
                    error: 'Video not found'
                })
            }


            if (videoToStream.isProtected && req.query.t !== '12398982394234o9u23409823498273423') {
                return res.status(UNAUTHORIZED).json({
                    error: 'Invalid access'
                })
            }


            axios.get(videoToStream.videoLink, {
                responseType: 'stream'
            })
                .then((stream: any) => {
                    // console.log('streaming started for ', videoObj)
                    res.writeHead(stream.status, stream.headers)
                    stream.data.pipe(res)
                })
                .catch((err: any) => console.error(err.message))
        })
    }

}


export default new VideoHandler().router;