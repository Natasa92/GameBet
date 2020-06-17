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
    it('get all accounts on network', () => {
        assert.ok(accounts.length > 0);
    });

    it('deploys contract on network', () => {
        assert.ok(gameBetAbi.options.address);
    });

    it('creates a FootballGameBet', async () => {
        await gameBetAbi.methods.createFootballBet(
            "Manchester City",
            "Chelsea",
            1600617600,
            web3.utils.toWei("1", 'ether')
        ).send({from: accounts[0], gas: 3000000});

        const bets = await gameBetAbi.methods.getBets().call({from: accounts[0]});

        assert.equal(bets.length, 2);
        assert.ok(bets[1]);
    });

    it('returns all bets', async () => {
        assert.equal(betsAddresses.length, 1);
    });

    it('returns all organisers', async() => {
        const organisers = await gameBetAbi.methods.getOrganisers().call({from: accounts[0]});

        assert.equal(organisers.length, 1);
        assert.ok(organisers[0], accounts[0]);
    });

    it('player cant vote for organiser if he didnt bet', async() => {
        const canVote = await gameBetAbi.methods.canVote(accounts[0], betsAddresses[0]).call({from: accounts[1]});

        assert.ok(!canVote);
    });

    it('returns ratings of organiser', async() => {
        const organiser = await gameBetAbi.methods.ratings(accounts[0]).call({from: accounts[0]});

        assert.ok(organiser.active);
        assert.equal(organiser.numberOfTimesRated, 0);
        assert.equal(organiser.totalRate, 0);
    });

    // Next two tests will only pass if game is started or finished, but because start time can't be before current time when bet is created, this tests won't pass
    it('player can vote for organiser if he bet', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[1], gas: 3000000, value: web3.utils.toWei("1", 'ether')});

        const canVote = await gameBetAbi.methods.canVote(accounts[0], betsAddresses[0]).call({from: accounts[1]});
        assert.ok(canVote);
    });

    it('vote for organiser of bet', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[1], gas: 3000000, value: web3.utils.toWei("1", 'ether')});

        await gameBetAbi.methods.vote(accounts[0], betsAddresses[0], 3).send({from: accounts[1], gas: 3000000});
        
        const hasVoted = await gameBetAbi.methods.hasVoted(accounts[0], betsAddresses[0], accounts[1]).call({from: accounts[0]});
        const organiser = await gameBetAbi.methods.ratings(accounts[0]).call({from: accounts[0]});

        assert.ok(hasVoted);
        assert.equal(organiser.numberOfTimesRated, 1);
        assert.equal(organiser.totalRate, 3);
    });
});


describe('FootballGameBet testing', () => {
    it('are all properties properly set', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        const homeTeamName = await footballGameBet.methods.homeTeam().call({from: accounts[0]});
        const awayTeamName = await footballGameBet.methods.awayTeam().call({from: accounts[0]});
        const startTime = await footballGameBet.methods.startTime().call({from: accounts[0]});
        const stake = await footballGameBet.methods.stake().call({from: accounts[0]});
        const organiser = await footballGameBet.methods.organiser().call({from: accounts[0]});

        assert.equal(startTime, 1600617600);
        assert.equal(homeTeamName, "Chelsea");
        assert.equal(awayTeamName, "Manchester United")
        assert.equal(web3.utils.fromWei(stake, 'ether'), 1);
        assert.equal(accounts[0], organiser);
    });

    it('place bet on home team', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[2], gas: 3000000, value: web3.utils.toWei("1", 'ether')});

        const players = await footballGameBet.methods.getAllPlayers().call({from: accounts[0]});
        const bet = await footballGameBet.methods.bets(accounts[2]).call({from: accounts[0]});

        assert.equal(players[0], accounts[2]);
        assert.equal(bet, 1);
    });

    it('place bet on away team', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        await footballGameBet.methods.betOnAwayTeam().send({from: accounts[2], gas: 3000000, value: web3.utils.toWei("1", 'ether')});

        const players = await footballGameBet.methods.getAllPlayers().call({from: accounts[0]});
        const bet = await footballGameBet.methods.bets(accounts[2]).call({from: accounts[0]});

        assert.equal(players[0], accounts[2]);
        assert.equal(bet, 2);
    });

    it('returns all players', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        await footballGameBet.methods.betOnAwayTeam().send({from: accounts[2], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[3], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[1], gas: 3000000, value: web3.utils.toWei("1", 'ether')});

        const players = await footballGameBet.methods.getAllPlayers().call({from: accounts[0]});
        
        assert.equal(players.length, 3);
        assert.ok(players.includes(accounts[1]));
        assert.ok(players.includes(accounts[2]));
        assert.ok(players.includes(accounts[3]));
    });

    it('finish game properly', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[2], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        await footballGameBet.methods.gameFinished(3,2).send({from: accounts[0], gas: 3000000});

        const homeTeamGoals = await footballGameBet.methods.homeTeamGoals().call({from: accounts[0]});
        const awayTeamGoals = await footballGameBet.methods.awayTeamGoals().call({from: accounts[0]});

        assert.equal(homeTeamGoals, 3);
        assert.equal(awayTeamGoals, 2);
    });

    it('finish game and properly pay winners that bet on home team to win', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        const acc0Balance = await web3.eth.getBalance(accounts[0]);
        
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[2], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc2Balance = await web3.eth.getBalance(accounts[2]);
        
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[1], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc1Balance = await web3.eth.getBalance(accounts[1]);
        
        await footballGameBet.methods.betOnAwayTeam().send({from: accounts[3], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc3Balance = await web3.eth.getBalance(accounts[3]);
        
        await footballGameBet.methods.gameFinished(3,2).send({from: accounts[0], gas: 3000000});

        const acc0BalanceAfterFinish = await web3.eth.getBalance(accounts[0]);
        const acc2BalanceAfterWin = await web3.eth.getBalance(accounts[2]);
        const acc1BalanceAfterWin = await web3.eth.getBalance(accounts[1]);
        const acc3BalanceAfterLoss = await web3.eth.getBalance(accounts[3]);
        
        assert.ok(BigInt(acc0Balance) < BigInt(acc0BalanceAfterFinish)); // Account 0 has 21 digit amount of ether so BigInt is needed
        assert.ok(acc2Balance < acc2BalanceAfterWin);
        assert.ok(acc1Balance < BigInt(acc1BalanceAfterWin));
        assert.equal(acc3Balance, acc3BalanceAfterLoss);
    });

    it('finish game and properly return stake if game is draw', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        const acc0Balance = await web3.eth.getBalance(accounts[0]);
        
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[2], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc2Balance = await web3.eth.getBalance(accounts[2]);
        
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[1], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc1Balance = await web3.eth.getBalance(accounts[1]);
        
        await footballGameBet.methods.betOnAwayTeam().send({from: accounts[3], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc3Balance = await web3.eth.getBalance(accounts[3]);
        
        await footballGameBet.methods.gameFinished(0,0).send({from: accounts[0], gas: 3000000});

        const acc0BalanceAfterFinish = await web3.eth.getBalance(accounts[0]);
        const acc2BalanceAfterFinish = await web3.eth.getBalance(accounts[2]);
        const acc1BalanceAfterFinish = await web3.eth.getBalance(accounts[1]);
        const acc3BalanceAfterFinish = await web3.eth.getBalance(accounts[3]);

        assert.ok(acc0Balance > acc0BalanceAfterFinish);
        assert.ok(acc2Balance < acc2BalanceAfterFinish);
        assert.ok(acc1Balance < BigInt(acc1BalanceAfterFinish));
        assert.ok(acc3Balance < acc3BalanceAfterFinish);
    });

    it('finish game and properly pay winners that bet on away team to win', async() => {
        const footballGameBet = new web3.eth.Contract(FootballGameBet.abi, betsAddresses[0]);

        const acc0Balance = await web3.eth.getBalance(accounts[0]);
        
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[2], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc2Balance = await web3.eth.getBalance(accounts[2]);
        
        await footballGameBet.methods.betOnHomeTeam().send({from: accounts[1], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc1Balance = await web3.eth.getBalance(accounts[1]);
        
        await footballGameBet.methods.betOnAwayTeam().send({from: accounts[3], gas: 3000000, value: web3.utils.toWei("1", 'ether')});
        const acc3Balance = await web3.eth.getBalance(accounts[3]);
        
        await footballGameBet.methods.gameFinished(2,3).send({from: accounts[0], gas: 3000000});

        const acc0BalanceAfterFinish = await web3.eth.getBalance(accounts[0]);
        const acc2BalanceAfterLoss = await web3.eth.getBalance(accounts[2]);
        const acc1BalanceAfterLoss = await web3.eth.getBalance(accounts[1]);
        const acc3BalanceAfterWin = await web3.eth.getBalance(accounts[3]);
        
        assert.ok(BigInt(acc0Balance) < BigInt(acc0BalanceAfterFinish));
        assert.equal(acc2Balance, acc2BalanceAfterLoss);
        assert.equal(acc1Balance, BigInt(acc1BalanceAfterLoss));
        assert.ok(acc3Balance < BigInt(acc3BalanceAfterWin));
    });
});


