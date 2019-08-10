import express from 'express';
import {Request, Response} from 'express';

import * as passportConfig from '../config/passport';
import * as helpeeController from '../controllers/helpee';
import * as transactionController from '../controllers/transaction';
import * as userController from '../controllers/user';
import * as waykiController from '../controllers/wayki';
import isHelperPolicy from '../policies/is-helper.policy';
import ownerPolicy from '../policies/owner.policy';

const userPolicy = [
    passportConfig.isAuthenticated,
    ownerPolicy,
];

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.send('Hello wrold');
});

router.post('/signup', userController.signup);
router.post('/signin', userController.login);
router.get('/logout', userController.logout);
router.put('/password', passportConfig.isAuthenticated,
    userController.updatePassword);

router.get(
    '/helpees',
    passportConfig.isAuthenticated,
    isHelperPolicy,
    helpeeController.getHelpees,
);
router.get(
    '/helpees/:id',
    passportConfig.isAuthenticated,
    isHelperPolicy,
    helpeeController.getHelpeeByID,
);

router.get(
    '/balances',
    passportConfig.isAuthenticated,
    waykiController.userBalances);

// TODO
router.post(
    '/donates',
    passportConfig.isAuthenticated,
    waykiController.donates);
router.post(
    '/pay',
    passportConfig.isAuthenticated,
    waykiController.pay);

router.get(
    '/faucet',
    passportConfig.isAuthenticated,
    isHelperPolicy,
    waykiController.faucets);

router.get(
    '/getData',
    passportConfig.isAuthenticated,
    waykiController.getData);

router.get(
    '/transactions',
    transactionController.find);
router.get(
    '/transactions/:id',
    passportConfig.isAuthenticated,
    transactionController.findByID);

export default router;
