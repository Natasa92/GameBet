import web3 from '../ethereum/web3';
import { Bet as BetConstants } from '../constants';

export const currencyConvert = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency || (fromCurrency === BetConstants.Currency.WEI && amount < 1)) {
    return amount;
  } else if (toCurrency === BetConstants.Currency.WEI) {
    return web3.utils.toWei(amount, fromCurrency);
  } else {
    return web3.utils.fromWei(amount, toCurrency);
  }
};