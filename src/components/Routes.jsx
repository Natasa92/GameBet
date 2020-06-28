import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { RouteList } from '../config';
import { RoutePaths } from '../constants';

const Routes = ({ account, getAccount }) => (
  <Switch>
    {RouteList.map(({ path, component: Component, layout: Layout }, index) => (
      <Route
        key={`${index + 1}`}
        exact
        path={path}
        render={(props) => (
          Layout
            ? (
              <Layout>
                <Component {...props} account={account} getAccount={getAccount} />
              </Layout>
            ) : (<Component {...props} account={account} getAccount={getAccount} />)
        )}
      />
    ))}
    <Redirect from="*" to={RoutePaths.NOT_FOUND} />
  </Switch>
);

export default Routes;