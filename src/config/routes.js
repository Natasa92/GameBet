import { RoutePaths } from '../constants';
import BetsPage from '../components/BetsPage';
import CreateBetPage from '../components/CreateBetPage';

export default [
  {
    path: RoutePaths.BETS,
    component: BetsPage,
  },
  {
    path: RoutePaths.CREATE_BET,
    component: CreateBetPage,
  }
];