const path = require('path');
const fs = require('fs-extra');

// Solidity compailer
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'src','ethereum', 'build');
fs.removeSync(buildPath);

const footballGameBetPath = path.resolve(__dirname, 'src','ethereum', 'contracts', 'FootballGameBet.sol');
const gameBetPath = path.resolve(__dirname, 'src','ethereum', 'contracts', 'GameBet.sol');

const contractsSources = {
    'FootballGameBet.sol': fs.readFileSync(footballGameBetPath, 'utf8'),
    'GameBet.sol': fs.readFileSync(gameBetPath, 'utf8')
}

const jsonContractsSources = JSON.stringify({
    language: 'Solidity',
    sources: {
        'FootballGameBet.sol': {
            content: contractsSources['FootballGameBet.sol']
        },
        'GameBet.sol': {
            content: contractsSources['GameBet.sol']
        }
    },
    settings: { 
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
});

const output = solc.compile({contractsSources},1);

fs.ensureDirSync(buildPath);

for(let contract in output){
    console.log(contract);
    fs.outputJsonSync(path.resolve(buildPath, contract.substring(contract.indexOf(':')+1) + '.json'), output[contract]);
}