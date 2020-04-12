import logger from './Logger';
import { Request, Response } from 'express';
export const pErr = (err: Error) => {
    if (err) {
        logger.error(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

export const respondJSON = (req: Request, res: Response) => {
    logger.info({ response: req.body })
} 