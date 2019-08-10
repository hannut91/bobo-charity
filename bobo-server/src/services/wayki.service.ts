import axios from 'axios';
import _ from 'lodash';

const bitcore = require('wicc-wallet-lib');

const apiURL = 'https://baas-test.wiccdev.org/v2/api';
const FEE = 1000000;
const BOBO_REG_ID = '1109897-2';

const post = async (url: string, data: any) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };
    return await axios.post(url, data, options);
};

export const createKeyChain = async () => {
    const {data} = await post(`${apiURL}/account/getnewaddress`, {});

    return {
        privateKey: data.data.privkey,
        address: data.data.addr,
    };
};

export const getBalance = async (address: string) => {
    const {data} = await post(`${apiURL}/account/getaccountinfo`, {address});

    if (data.code !== 0) {
        throw new Error(data.msg);
    }
    return data.data.balance;
};

export const faucet = async (address: string) => {
    await axios.get(`https://faucet.wiccdev.org/testnet/getwicc/${address}`);
};

export const sendRawTx = async (rawtx: string) => {
    return await post(`${apiURL}/transaction/sendrawtx`, {rawtx});
};

export const createRawTx = (height: number,
                            senderRegID: string,
                            wiccPrivateKey: string,
                            to: string,
                            amount: number,
                            message: string) => {
    const wiccApi = new bitcore.WiccApi({network: 'testnet'});
    const toAddressHex = toHexFromString(to);
    const amountHex = encodeAmount(amount);
    const messageHex = toHexFromString(message);

    const regAppInfo = {
        nTxType: bitcore.WiccApi.CONTRACT_TX,
        nVersion: 1,
        nValidHeight: height,
        srcRegId: senderRegID,
        destRegId: BOBO_REG_ID,
        fees: FEE,
        value: 0,
        vContract: 'f0160000' + toAddressHex + amountHex + messageHex,
    };

    return wiccApi.createSignTransaction(
        bitcore.PrivateKey.fromWIF(wiccPrivateKey),
        bitcore.WiccApi.CONTRACT_TX,
        regAppInfo,
    );
};

export const getHeight = async () => {
    const {data} = await post(`${apiURL}/block/getinfo`, {});
    return data.data.blocks;
};

export const registerAccount = async (address: string) => {
    const {data} = await post(`${apiURL}/account/registeraccounttx`, {address});
    if (data.code !== 0) {
        throw new Error(data.msg);
    }
    return data.data.hash;
};

export const getRegID = async (address: string) => {
    const {data} = await post(`${apiURL}/account/getaccountinfo`, {address});
    return data.data.regid;
};

export const getTokenBalance = async (address: string) => {
    const {data} = await post(`${apiURL}/contract/getcontractaccountinfo`, {
        address,
        contractregid: BOBO_REG_ID,
    });

    return data.data.freevalues;
};

export const sendToken = async (privateKey: string,
                                to: string,
                                amount: number,
                                message: string) => {
    const from = bitcore.PrivateKey.fromWIF(privateKey).toAddress().toString();
    const senderRegID = await getRegID(from);
    const height = await getHeight();
    const rawtx = createRawTx(height, senderRegID, privateKey, to, amount, message);
    const {data} = await sendRawTx(rawtx);

    return data.data.hash;
};

export const encodeAmount = (amount: number) => {
    let money = amount.toString(16);

    if (money.length % 2 !== 0) {
        money = '0' + money;
    }
    const data = _.chunk(money.split(''), 2)
        .map((numbers: any) => {
            [numbers[0], numbers[1]] = [numbers[1], numbers[0]];

            return numbers;
        })
        .reduce((acc: any, cur: any) => {
            return acc.concat(cur);
        }, [])
        .reverse().join('');

    const remains = (16 - data.length);

    return data + _.repeat('0', remains);
};

export const toHexFromString = (address: string) => {
    let result = '';

    for (let i = 0; i < address.length; i++) {
        const hex = address.charCodeAt(i).toString(16);
        result += ('0' + hex).slice(-2);
    }

    return result;
};

export const getContractData = async (txHash: string) => {
    const {data} = await post(`${apiURL}/contract/getcontractdata`, {
        key: txHash,
        regid: BOBO_REG_ID,
        returndatatype: 'STRING',
    });

    console.log('data ::: ', data);

    return data.data.value;
};
