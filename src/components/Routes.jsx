import React from 'react';
import { Route, Switch } from 'react-router-dom';
import BetsPage from './BetsPage';
import CreateBetPage from './CreateBetPage';
import PublicBetPage from './PublicBetPage';
import { RoutePaths } from '../config';

const Routes = () => (
  <Switch>
    <Route path={RoutePaths.BETS} exact component={BetsPage} />
    <Route path={RoutePaths.CREATE_BET} component={CreateBetPage} />
    <Route path={RoutePaths.PUBLIC_BET} exact component={PublicBetPage} />
  </Switch>
);

export default Routes;