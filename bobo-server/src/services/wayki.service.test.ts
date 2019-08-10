const bitcore = require('wicc-wallet-lib');

import {
    createKeyChain,
    encodeAmount,
    faucet,
    getBalance,
    getHeight,
    getTokenBalance,
    registerAccount,
    toHexFromString,
} from './wayki.service';

jest.setTimeout(30000);

describe('createKeyChain', () => {
    it('returns privateKey and address', async () => {
        const keyChain = await createKeyChain();

        expect(keyChain.privateKey).toBeTruthy();
        expect(keyChain.privateKey.length).toBe(52);
        expect(keyChain.address.length).toBe(34);
    });
});

describe('getBalance', () => {
    let address: string;

    describe('with has balance', () => {
        beforeEach(() => {
            address = 'wLgnhKNtk6vCHoYPb5XYMQ7uQZtA4FV5ge';
        });

        it('returns balance', async () => {
            const wicc = await getBalance(address);

            expect(wicc > 0).toBeTruthy();
        });
    });

    describe('with no balance', () => {
        beforeEach(() => {
            address = 'wrong address';
        });

        it('returns 0', async () => {
            try {
                await getBalance(address);
            } catch (err) {
                expect(err.message).toBe('Invalid address');
            }
        });
    });
});

describe('registerAccount', () => {
    let address: string;

    describe('with unregistred address', () => {
        beforeEach(async () => {
            const keyChain = await createKeyChain();

            address = keyChain.address;

            await faucet(address);

            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 20000);
            });
        });

        it('returns hash', async () => {
            const hash = await registerAccount(address);

            expect(hash.length > 0).toBeTruthy();
        });
    });

    describe('with already registered address', () => {
        beforeEach(() => {
            address = 'wLgnhKNtk6vCHoYPb5XYMQ7uQZtA4FV5ge';
        });

        it('returns Account was already registered error', async () => {
            try {
                await registerAccount(address);
            } catch (err) {
                expect(err.message).toBe('in registeraccounttx Error: Account ' +
                    'was already registered.');
            }
        });
    });
});

// 사용할 때 풀어주
// describe('getRegID', () => {
//     const address = 'wLgnhKNtk6vCHoYPb5XYMQ7uQZtA4FV5ge';
//     const regID = '1106934-1';
//
//     it('returns regID', async () => {
//         const id = await getRegID(address);
//         expect(id).toBe(regID);
//     });
// });

// describe('newTokenFaucet', () => {
//     it('increase my token balance', async () => {
//         const {address} = await createKeyChain();
//
//         await faucet(address);
//
//         setTimeout(async () => {
//             const balance = await getBalance(address);
//
//             expect(balance).toBe(100000000);
//         }, 15000);
//     });
// });

describe('getHeight', () => {
    it('get current height', async () => {
        const height = await getHeight();
        expect(height > 0).toBeTruthy();
    });
});

describe('getTokenBalance', () => {
    const adminAddress = 'wLgnhKNtk6vCHoYPb5XYMQ7uQZtA4FV5ge';

    it('get current token balance', async () => {
        const balance = await getTokenBalance(adminAddress);

        expect(balance > 0).toBeTruthy();
    });
});

describe('utils', () => {
    it('converts data', () => {
        expect(toHexFromString('wNPWqv9bvFCnMm1ddiQdH7fUwUk2Qgrs2N'))
            .toBe('774e5057717639627646436e4d6d3164646951644837665577556b3251677273324e');
        expect(encodeAmount(1000000000000)).toBe('0010a5d4e8000000');
        expect(encodeAmount(5000000000)).toBe('00f2052a01000000');
    });
});

// describe('sendToken', () => {
//     const privateKey = 'Y8mLNAWcRLu754ao1oDA2B4hgvDmuPxcJtw4pLHgZaR9GbNdEGPP';
//     const to = 'wSVrnCH1vDAWhSRxRGH5en8xiWM8back3B';
//     const amount = 10;
//
//     it('decreases balance of sender', async () => {
//         await sendToken(privateKey, to, amount);
//     });
// });
