import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import Spinner from 'react-spinkit';
import {
  TextField, Button, Box, Select, MenuItem, Backdrop,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import GameBetContract from '../ethereum/gameBet';
import { RoutePaths, Bet as BetConstants } from '../constants';
import { currencyConvert } from '../helpers';

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

const CreateBetPage = ({ getAccount, history }) => {
  const classes = useStyles();
  const [data, setData] = useState({
    homeTeam: '',
    awayTeam: '',
    startTime: moment().valueOf(),
    stake: '0',
    currency: BetConstants.Currency.WEI,
  });
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = event => {
    const { id, value } = event.target;

    if (error) {
      setError();
    }

    setData({ ...data, [id]: value });
  };

  const handleCurrencyChange = (event) => {
    const { value } = event.target;
    const { currency, stake } = data;
    const newState = {};

    newState.stake = currencyConvert(stake, currency, value);
    newState.currency = value;

    setData({ ...data, ...newState });
  };

  const handleDateTimeChange = (value) => {
    handleChange({ target: { id: 'startTime', value: value.valueOf() } });
    setData({ ...data, startTime: value.valueOf() });
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    await setError(null);
    await setLoading(true);
    const { homeTeam, awayTeam, startTime, currency, stake } = data;

    let isFormValid = true;
    if (currency === BetConstants.Currency.WEI && stake < 1) {
      setError('Invalid value for stake.');
      isFormValid = false;
      
    }
    
    const _account = await getAccount();

    if (isFormValid && _account) {
      try {
        const gameBetContract = GameBetContract();
        const _stake = currencyConvert(stake, currency, BetConstants.Currency.WEI);
        await gameBetContract.methods.createFootballBet(homeTeam, awayTeam, moment(startTime).unix(), _stake).send({ from: _account });
        await setLoading(false);
        enqueueSnackbar('The game bet has been successfully created.', { variant: 'success' });
        history.push(RoutePaths.BETS);
      } catch (e) {
        enqueueSnackbar('Error occured while creating the bet.', { variant: 'error' });
      }
    }

    await setLoading(false);
  };

  return (
    <>
      <Backdrop className={`${classes.backdrop} overlay`} open={loading && !error}>
        <Spinner name="ball-pulse-sync" />
      </Backdrop>
      <Box className="create-bet" mt={6}>
        <div className="create-bet__content">
          {error && (
            <Alert severity="error" className="alert">
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          <form className={`create-bet__form ${classes.root}`} onSubmit={handleOnSubmit}>
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
              <Select
                id="currency"
                value={data.currency}
                onChange={handleCurrencyChange}
                className="create-bet__currency"
              >
                <MenuItem value="wei">Wei</MenuItem>
                <MenuItem value="ether">Ether</MenuItem>
              </Select>
            </div>
            <Button variant="contained" className="button create-bet__button mt24" type="submit">
              Create Bet
            </Button>
          </form>
        </div>
        <img className="create-bet__img" src="/illustrations/add-bet.svg" alt="Create Bet" />
      </Box>
    </>
  );
}

export default withRouter(CreateBetPage);