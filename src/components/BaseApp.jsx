import React from 'react';
import withAccount from './HOC/withAccount';
import Routes from './Routes';

const BaseApp = ({ account, getAccount }) => (
  <Routes account={account} getAccount={getAccount} />
);

export default withAccount(BaseApp);