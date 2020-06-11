import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { RouteList } from '../config';

const Routes = () => (
  <Switch>
    {RouteList.map((route, index) => (
      <Route key={`${index + 1}`} exact path={route.path} component={route.component} />
    ))}
  </Switch>
);

export default Routes;