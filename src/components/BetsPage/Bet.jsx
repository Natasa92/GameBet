import React, { useState } from 'react';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Divider,
  Box,
  Button,
  TextField,
} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import GameBetContract from '../../ethereum/gameBet';
import FootballGameBetContract from '../../ethereum/footballGameBet';
import { Bet as BetConstants } from '../../constants';
import { BetConfig } from '../../config';
import {
  validateGoalInput, validateRate, currencyConvert, capitalize,
} from '../../helpers';

const BetDetails = ({
  data: bet, account, setShowOverlayLoader, reloadBets, clearTimer, getAccount,
}) => {
  const [rate, setRate] = useState(0);
  const [goals, setGoals] = useState({ home: '', away: '' });
  const [goalsError, setGoalsError] = useState({ home: null, away: null });
  const [saveGoalsButtonDisabled, setSaveGoalsButtonDisabled] = useState(true);
  const [voteButtonDisabled, setVoteButtonDisabled] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const gameBets = GameBetContract();
  const footballGameBetInstance = FootballGameBetContract(bet.address);

  const canSaveResults = () => {
    const {
      isValid: isHomeGoalsValid,
      message: homeGoalsErrorMessage,
    } = validateGoalInput('home', goals.home);
    const {
      isValid: isAwayGoalsValid,
      message: awayGoalsErrorMessage,
    } = validateGoalInput('away', goals.away);

    if (isHomeGoalsValid && isAwayGoalsValid) {
      setSaveGoalsButtonDisabled(false);
    } else {
      setGoalsError({ home: homeGoalsErrorMessage, away: awayGoalsErrorMessage });
      setSaveGoalsButtonDisabled(true);
    }
  };

  const handleRateChange = (event, newValue) => {
    const isRateValid = validateRate(newValue)
    setVoteButtonDisabled(!isRateValid);
    if (isRateValid) {
      setRate(newValue);
    }
  };

  const handleGoalChange = (event) => {
    const { id, value } = event.target;

    if (id.indexOf('home') !== -1) {
      setGoals({ ...goals, home: value });
      setGoalsError({ ...goalsError, home: null });
    } else {
      setGoals({ ...goals, away: value });
      setGoalsError({ ...goalsError, away: null });
    }

    canSaveResults();
  };

  const handleVoteClick = async (event) => {
    event.stopPropagation();
    clearTimer();
    await setShowOverlayLoader(true);

    const _account = await getAccount();

    if (_account) {
      try {
        await gameBets.methods.vote(bet.organiser, bet.address, rate).send({ from: _account });
        await reloadBets();
        enqueueSnackbar(`You have successfully submited rate for organiser ${bet.organiser}.`, { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(`Error occured while submiting the rate for the organiser ${bet.organiser}.`, { variant: 'error' });
        console.error(error);
      }
    }

    await setShowOverlayLoader(false);
  };

  const handleResultSubmit = async (event) => {
    event.stopPropagation();
    clearTimer();
    await setShowOverlayLoader(true);

    const _account = await getAccount();

    if (_account) {
      try {
        await footballGameBetInstance.methods.gameFinished(Number(goals.home), Number(goals.away)).send({ from: _account });
        await reloadBets();
        enqueueSnackbar(`You have successfully submited results for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'success' });
      } catch (e) {
        enqueueSnackbar(`Error occured while submiting the result for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'error' });
        console.error(e);
      }
    }

    await setShowOverlayLoader(false);
   
  };

  const handleBetClick = (team) => async (event) => {
    event.stopPropagation();
    clearTimer();
    await setShowOverlayLoader(true);

    const _account = await getAccount();

    if (_account) {
      try {
        if (team === 'home') {
          await footballGameBetInstance.methods.betOnHomeTeam().send({ from: _account, value: bet.stake });
        } else {
          await footballGameBetInstance.methods.betOnAwayTeam().send({ from: _account, value: bet.stake });
        }

        await reloadBets();
        enqueueSnackbar(`You have successfully submited your bet on the ${team} team for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(`Error occured while submiting the bet for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'error' });
        console.error(error);
      }
    }

    await setShowOverlayLoader(false);
  };

  const formatData = () => {
    const _data = {};
    _data.time = moment.unix(bet.startTime).format('DD/MM/YYYY HH:mm');
    _data.result = `${isGameEnded ? bet.homeTeamGoals : '-'} : ${isGameEnded ? bet.awayTeamGoals : '-'}`;
    _data.teams = `${bet.homeTeam} : ${bet.awayTeam}`;
    const _stake = currencyConvert(bet.stake, BetConstants.Currency.WEI, BetConstants.Currency.ETHER)
    _data.stake = `${_stake} ${capitalize(BetConstants.Currency.ETHER)}`;
    return _data;
  }

  const isGameEnded = Number(bet.startTime) + BetConfig.GAME_DURATION < moment().unix();
  const showResultForm = account === bet.organiser && isGameEnded && bet.balance > 0;
  const showVote = !bet.hasVoted && isGameEnded && bet.organiser !== account && (bet.betOn === '1' || bet.betOn === '2');
  const canBet = Number(bet.startTime) > moment().unix();
  const data = formatData();

  return (
    <ExpansionPanel key={bet.address}>
      <ExpansionPanelSummary
        aria-controls={bet.address}
        id={bet.address}
        className="bet-summary"
      >
        <Box mr={2} className="start-time inline-flex align-items__center">
          {data.time}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="results inline-flex align-items__center justify-content__center">
          {data.result}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="teams inline-flex align-items__center">
          {data.teams}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="stake inline-flex align-items__center justify-content__flex-end">
          {data.stake}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="actions inline-flex align-items__center">
          <Button
            onClick={handleBetClick('home')}
            disabled={!canBet || bet.betOn === '1' || bet.betOn === '2'}
            className={`${bet.betOn === '1' ? 'bet-on' : ''} ${bet.betOn === '2' ? 'visibility__hidden' : ''}`}
          >
            {bet.betOn === '1' ? 'You bet on Home Team' : `Home Team Wins`}
          </Button>
          <Button
            onClick={handleBetClick('away')}
            disabled={!canBet || bet.betOn === '1' || bet.betOn === '2'}
            className={`${bet.betOn === '2' ? 'bet-on' : ''} ${bet.betOn === '1' ? 'visibilty__hidden' : ''}`}
          >
            {bet.betOn === '2' ? `You bet on Away Team` : `Away Team Wins`}
          </Button>
        </Box>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className="bet-details">
        <Box m={2}>
          <Box className="organiser">
            <TextField
              id={bet.organiser}
              label="Organiser"
              defaultValue={bet.organiser}
              InputProps={{
                readOnly: true,
              }}
            />
            {showVote && (
              <>
                <Rating
                  name={`rate-${bet.address}`}
                  value={rate}
                  precision={1}
                  onChange={handleRateChange}
                  className="ml84"
                />
                <Button
                  disabled={voteButtonDisabled}
                  className="vote-button"
                  onClick={handleVoteClick}
                >
                  Vote
                </Button>
              </>
            )}
          </Box>
          {showResultForm && (
            <Box mt={4}>
              <form className="results-form">
                <TextField
                  required
                  error={goalsError.home != null}
                  id={`homeTeamGoals-${bet.address}`}
                  label="Home Team Goals"
                  onChange={handleGoalChange}
                  placeholder="Home Team Goals"
                  InputLabelProps={{ shrink: true }}
                  helperText={goalsError.home}
                  onBlur={handleGoalChange}
                />
                <TextField
                  required
                  error={goalsError.away != null}
                  id={`awayTeamGoals-${bet.address}`}
                  label="Away Team Goals"
                  onChange={handleGoalChange}
                  placeholder="Away Team Goals"
                  InputLabelProps={{ shrink: true }}
                  style={{ marginLeft: "2rem" }}
                  helperText={goalsError.away}
                  onBlur={handleGoalChange}
                />
                <Button
                  disabled={saveGoalsButtonDisabled}
                  className="save-results-button"
                  onClick={handleResultSubmit}
                >
                  Save
                </Button>
              </form>
            </Box>
          )}
        </Box>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default BetDetails;