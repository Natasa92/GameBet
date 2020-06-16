import Web3 from 'web3';

let web3;

if (typeof window != 'undefined' && typeof window.web3 !== 'undefined') {
  // Metamask is available
  web3 = new Web3(window.web3.currentProvider);
} else {
  // Metamask is not available, use Infura
  const provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/04f72c758d3e4756859967e2fd8d7d83');

  web3 = new Web3(provider);
}

export default web3;