import web3 from './web3';
import FootballGameBet from './build/FootballGameBet.json';

export default (address) => (new web3.eth.Contract(FootballGameBet.abi, address));