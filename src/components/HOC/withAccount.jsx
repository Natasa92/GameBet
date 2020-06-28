import React, { Component } from 'react';
import Spinner from 'react-spinkit';
import web3 from '../../ethereum/web3';
import AccountNotConnected from './AccountNotConnected';

const withAccount = (WrappedComponent) => {
  return class extends Component {
    constructor(props) {
      super(props);

      this.state = {
        account: null,
        error: false,
        loading: false,
      };
    }

    componentDidMount() {
      this.loadAccount();
    }

    loadAccount = async () => {
      await this.setState({ loading: true });
      const account = await this.getAccount();
      await this.setState({ loading: false, account });
    }

    getAccount = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
    
        if (!accounts[0]) {
          throw new Error();
        }
    
        return accounts[0];
      } catch (err) {
        await this.setState({ error: true });
      }
    }

    render() {
      const { account, error, loading } = this.state;

      if (loading) {
        return (
          <div className="loading account">
            <Spinner name="ball-pulse-sync" />
          </div>
        );
      }

      if (error || !account) {
        return (<AccountNotConnected />);
      }

      return <WrappedComponent account={account} getAccount={this.getAccount} {...this.props} />;
    }
  }
};

export default withAccount;