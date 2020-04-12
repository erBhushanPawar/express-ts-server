import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';

import UserDao from '@daos/User/UserDao.mock';
import { paramMissingError } from '@shared/constants';


class UserRouter {

    // Init shared
    router: Router;
    userDao: UserDao;
    constructor() {
        this.userDao = new UserDao();
        this.router = Router();
        this.mountEndpoints()
    }

    mountEndpoints() {
        this.router.get('/all', async (req: Request, res: Response) => {
            const users = await this.userDao.getAll();
            return res.status(OK).json({ users });
        });


        this.router.post('/add', async (req: Request, res: Response) => {
            const { user } = req.body;
            if (!user) {
                return res.status(BAD_REQUEST).json({
                    error: paramMissingError,
                });
            }
            await this.userDao.add(user);
            return res.status(CREATED).end();
        });


        this.router.put('/update', async (req: Request, res: Response) => {
            const { user } = req.body;
            if (!user) {
                return res.status(BAD_REQUEST).json({
                    error: paramMissingError,
                });
            }
            user.id = Number(user.id);
            await this.userDao.update(user);
            return res.status(OK).end();
        });

        this.router.delete('/delete/:id', async (req: Request, res: Response) => {
            const { id } = req.params as ParamsDictionary;
            await this.userDao.delete(Number(id));
            return res.status(OK).end();
        });

    }

}


export default new UserRouter().router;
