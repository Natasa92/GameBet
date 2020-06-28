import React from 'react';
import withAccount from './HOC/withAccount';
import Routes from './Routes';

const BaseApp = ({ account, getAccount }) => (
  <div className="container">
    <Routes account={account} getAccount={getAccount} />
  </div>
);

export default withAccount(BaseApp);