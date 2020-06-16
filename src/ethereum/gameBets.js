import web3 from './web3';
import GameBet from './build/GameBet.json';
import { address } from './contractAddress';

export default () => {
  return new web3.eth.Contract(
    JSON.parse(GameBet.interface),
    address
  );
};