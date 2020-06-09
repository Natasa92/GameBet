const assert = require('assert');
const ganche = require('ganache-cli'); // Testing network
const Web3 = require('web3'); 
// Web3 constructor requires provider for network
const web3 = new Web3(ganche.provider());

// Contracts
const GameBet = require('../build/GameBet.json');
const FootballGameBet = require('../build/FootballGameBet.json');

let accounts;
let gameBetAbi;
let betsAddresses;

// Prepare stuff for other tests
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    gameBetAbi = await new web3.eth.Contract(GameBet.abi).deploy({ data: GameBet.bytecode }).send({from: accounts[0], gas: 3000000});

    await gameBetAbi.methods.createFootballBet(
        "Chelsea",
        "Manchester United",
        1600617600,
        web3.utils.toWei("1", 'ether')
    ).send({from: accounts[0], gas: 3000000});

    betsAddresses = await gameBetAbi.methods.getBets().call({from: accounts[0]});
});

// Collection of it tests
describe('GameBet testing', () => {
    it('Get all accounts on network', () => {
        assert.notEqual(accounts.length, 0);
    });

    it('Deploys contract on network', () => {
        assert.ok(gameBetAbi.options.address);
    });

    it('Creates a FootballGameBet', async () => {
        assert.ok(betsAddresses[0]);
        assert.equal(betsAddresses.length, 1);
    });
});


describe('FootballGameBet testing', () => {
    beforeEach('Calls createBet', async () => {
        await gameBetAbi.methods.createFootballBet(
            "Chelsea",
            "Manchester United",
            1600617600,
            web3.utils.toWei("1", 'ether')
        ).send({from: accounts[0], gas: 3000000});
    });

    it('is startTime properly set', async() => {
        const footballGameBetAbi = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);
    
        const startTime = await footballGameBetAbi.methods.startTime().call({from: accounts[0]});

        assert.equal(startTime, 1600617600);
    });
});


