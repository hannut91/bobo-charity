import {Request, Response} from 'express';

import Transaction from '../models/Transaction';
import User from '../models/User';
import {
    faucet, getBalance, getContractData, getTokenBalance, registerAccount,
    sendToken,
} from '../services/wayki.service';
import {ADMIN_PRIVATE_KEY} from '../util/secrets';

export const userBalances = async (req: Request, res: Response) => {
    const {address} = req.user;

    try {
        const balance = await getTokenBalance(address);

        res.status(200).send({balance});
    } catch (err) {
        res.status(500).send({message: 'Internal server error'});
    }
};

export const faucets = async (req: Request, res: Response) => {
    const {address} = req.user;

    try {
        await sendToken(ADMIN_PRIVATE_KEY, address, 100, 'ad');

        res.status(200).send();
    } catch (err) {
        res.status(500).send({message: 'Internal server error'});
    }
};

export const donates = async (req: Request, res: Response) => {
    const {address, privateKey} = req.user;

    const {body} = req;

    try {
        const helpee = await User.findOne({
            _id: body.helpeeID,
        });

        const hash = await sendToken(
            privateKey,
            helpee.address,
            body.amount,
            body.memo,
        );

        await Transaction.create({
            hash,
            type: 'donation',
            from: address,
            to: helpee.address,
            amount: body.amount,
        });

        res.status(200).send();
    } catch (err) {
        console.log('err ::: ', err);
        res.status(500).send({message: 'Internal server error'});
    }
};

export const getData = async (req: Request, res: Response) => {
    const {query} = req;

    try {
        const value = await getContractData(query.hash);

        res.status(200).send({value});
    } catch (err) {
        console.error(err);
        res.status(500).send({message: 'Internal server error'});
    }
};

export const pay = async (req: Request, res: Response) => {
    const {address, privateKey} = req.user;

    const {body} = req;

    try {
        const hash = await sendToken(
            privateKey,
            'wLgnhKNtk6vCHoYPb5XYMQ7uQZtA4FV5ge',
            body.amount,
            body.memo,
        );

        await Transaction.create({
            hash,
            type: 'pay',
            from: address,
            to: 'wLgnhKNtk6vCHoYPb5XYMQ7uQZtA4FV5ge',
            amount: body.amount,
        });

        res.status(200).send();
    } catch (err) {
        console.log('err ::: ', err);
        res.status(500).send({message: 'Internal server error'});
    }
};
