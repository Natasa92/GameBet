import { RoutePaths } from '../constants';
import Layout from '../components/Layout';
import BetsPage from '../components/BetsPage';
import CreateBetPage from '../components/CreateBetPage';
import OrganisersPage from '../components/OrganisersPage';
import NotFoundPage from '../components/NotFoundPage';

export default [
  {
    path: RoutePaths.BETS,
    component: BetsPage,
    layout: Layout,
  },
  {
    path: RoutePaths.CREATE_BET,
    component: CreateBetPage,
    layout: Layout,
  },
  {
    path: RoutePaths.ORGANISERS,
    component: OrganisersPage,
    layout: Layout,
  },
  {
    path: RoutePaths.NOT_FOUND,
    component: NotFoundPage,
    layout: null,
  }
];