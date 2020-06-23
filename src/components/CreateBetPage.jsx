import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { TextField, Button, Box, Select, MenuItem, Backdrop, CircularProgress } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab'
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import GameBetContract from '../ethereum/gameBet';
import web3 from '../ethereum/web3';
import { RoutePaths } from '../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const CreateBetPage = ({ history }) => {
  const classes = useStyles();
  const [data, setData] = useState({
    homeTeam: '',
    awayTeam: '',
    startTime: moment().valueOf(),
    stake: '0',
    currency: 'wei'
  });
  const [formError, setFormError] = useState();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = event => {
    const { id, value } = event.target;

    if (formError) {
      setFormError(null);
    }

    setData({ ...data, [id]: value });
  };

  const currencyConvert = (newCurrency) => {
    const { currency, stake } = data;

    if (currency === newCurrency) {
      return stake;
    } else if (newCurrency === 'wei') {
      return web3.utils.toWei(stake, currency);
    } else if (stake < 1) {
      return stake;
    } else {
      return web3.utils.fromWei(stake, newCurrency);
    }
  };

  const handleCurrencyChange = (event) => {
    const { value } = event.target;
    const newState = {};

    newState.stake = currencyConvert(value);
    newState.currency = value;

    setData({ ...data, ...newState });
  };

  const handleDateTimeChange = (value) => {
    handleChange({ target: { id: 'startTime', value: value.valueOf() } });
    setData({ ...data, startTime: value.valueOf() });
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    await setLoading(true);
    const { homeTeam, awayTeam, startTime, currency, stake } = data;

    let isFormValid = true;
    if (currency === 'wei' && stake < 1) {
      setFormError('Invalid value for stake.');
      isFormValid = false;
    }
    
    if (isFormValid) {
      try {
        const accounts = await web3.eth.getAccounts();
        const gameBetContract = GameBetContract();
        const _stake = currencyConvert('wei');
        await gameBetContract.methods.createFootballBet(homeTeam, awayTeam, moment(startTime).unix(), _stake).send({ from: accounts[0], gas: 3000000 });
        await setLoading(false);
        history.push(RoutePaths.BETS);
        enqueueSnackbar('The game bet has been successfully created.', { variant: 'success' });
        return;
      } catch (e) {
        enqueueSnackbar('Error occured while creating the bet.', { variant: 'error' });
        console.error(e);
      }
    }

    await setLoading(false);
  };

  return (
    <>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box mt={6}>
        {formError && (
          <Alert severity="error" className="create-bet__alert">
            <AlertTitle>Error</AlertTitle>
            {formError}
          </Alert>
        )}
        <form className={`create-bet ${classes.root}`} onSubmit={handleOnSubmit}>
          <TextField
            required
            id="homeTeam"
            label="Home Team"
            value={data.homeTeam}
            onChange={handleChange}
            placeholder="Home Team"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            required
            id="awayTeam"
            label="Away Team"
            value={data.awayTeam}
            onChange={handleChange}
            placeholder="Away Team"
            InputLabelProps={{ shrink: true }}
          />
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DateTimePicker
              id="startTime"
              value={data.startTime}
              onChange={handleDateTimeChange}
              disablePast
              showTodayButton
              label="Game start's at"
            />
          </MuiPickersUtilsProvider>
          <div className="display__inline-flex">
            <TextField
              required
              id="stake"
              label="Stake"
              value={data.stake}
              onChange={handleChange}
              placeholder="Stake"
              InputLabelProps={{ shrink: true }}
              className="create-bet__stake"
            />
            <Select id="currency" value={data.currency} onChange={handleCurrencyChange} className="create-bet__currency">
              <MenuItem value="wei">Wei</MenuItem>
              <MenuItem value="ether">Ether</MenuItem>
            </Select>
          </div>
          <Button variant="contained" color="primary" className="mt24" type="submit">
            Create Bet
          </Button>
        </form>
      </Box>
    </>
  );
}

export default withRouter(CreateBetPage);