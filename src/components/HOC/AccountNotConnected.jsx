import React from 'react';
import { withRouter } from 'react-router-dom';

const AccountNotConnected = ({ location }) => (
  <div className="account-not-connected">
    <div className="info">
      <h2>{'Looks like you are not logged into MetaMask account or you haven\'t add application address to your MetaMask.'}</h2>
      <br />
      <a className="button reload" href={location.pathname}>Reload</a> 
    </div>
    <img src="/illustrations/into-the-night.svg" alt="access account" />
  </div>
);

export default withRouter(AccountNotConnected);