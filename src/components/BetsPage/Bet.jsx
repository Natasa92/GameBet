import React, { useState } from 'react';
import moment from 'moment';
import web3 from '../../ethereum/web3';
import { useSnackbar } from 'notistack';
import GameBetContract from '../../ethereum/gameBet';
import FootballGameBetContract from '../../ethereum/footballGameBet';
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

const BetDetails = ({ data: bet, account, votes, setShowOverlayLoader }) => {
  const [rate, setRate] = useState(0);
  const [goals, setGoals] = useState({ home: '', away: '' });
  const [goalsError, setGoalsError] = useState({ home: null, away: null });
  const [saveGoalsButtonDisabled, setSaveGoalsButtonDisabled] = useState(true);
  const [voteButtonDisabled, setVoteButtonDisabled] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const isGoalInputValid = (team, value) => {
    let isValid = true;

    if (isNaN(value)) {
      isValid = false;
      setGoalsError({ ...goalsError, [team]: "Incorrect entry." });
    }

    if (value == null || value === '') {
      isValid = false;
    }
    
    return isValid;
  };

  const canSaveResults = () => {
    if (isGoalInputValid('home', goals.home) && isGoalInputValid('away', goals.away)) {
      setSaveGoalsButtonDisabled(false);
    } else {
      setSaveGoalsButtonDisabled(true);
    }
  };

  const canSubmitVote = (value) => {
    if (value > 0 && value <= 5) {
      setVoteButtonDisabled(false);
    } else {
      setVoteButtonDisabled(true  );
    }
  };

  const handleRateChange = (event, newValue) => {
    canSubmitVote(newValue);
    setRate(newValue);
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
    await setShowOverlayLoader(true);
    
    try {
      const gameBets = GameBetContract();
      await gameBets.methods.vote(bet.organiser, bet.address, rate).send({ from: account, gas: 300000 });
      enqueueSnackbar(`You have successfully submited rate for organiser ${bet.organiser}.`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(`Error occured while submiting the rate for the organiser ${bet.organiser}.`, { variant: 'error' });
      console.error(error);
    }

    await setShowOverlayLoader(false);
  };
  const handleResultSubmit = async (event) => {
    event.stopPropagation();
    await setShowOverlayLoader(true);

    try {
      const footballGameBetInstance = FootballGameBetContract(bet.address);
      await footballGameBetInstance.methods.gameFinished(Number(goals.home), Number(goals.away)).send({ from: account, gas: 300000 });
      enqueueSnackbar(`You have successfully submited results for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(`Error occured while submiting the result for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'error' });
      console.error(e);
    }

    await setShowOverlayLoader(false);
  };

  const handleBetClick = (team) => async (event) => {
    event.stopPropagation();
    await setShowOverlayLoader(true);
    const footballGameBetInstance = FootballGameBetContract(bet.address);

    try {
      if (team === 'home') {
        await footballGameBetInstance.methods.betOnHomeTeam().send({ from: account, gas: 300000, value: bet.stake });
      } else {
        await footballGameBetInstance.methods.betOnAwayTeam().send({ from: account, gas: 300000, value: bet.stake });
      }
      enqueueSnackbar(`You have successfully submited your bet on the ${team} team for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(`Error occured while submiting the bet for the game ${bet.homeTeam} : ${bet.awayTeam}.`, { variant: 'error' });
      console.error(error);
    }

    await setShowOverlayLoader(false);
  };

  const isGameFinished = Number(bet.startTime) < moment().unix();
  const showResultForm = account === bet.organiser && isGameFinished && bet.balance > 0;
  const showVote = !bet.hasVoted && isGameFinished && bet.organiser !== account;

  return (
    <ExpansionPanel key={bet.address}>
      <ExpansionPanelSummary
        aria-controls={bet.address}
        id={bet.address}
        className="bet-summary"
      >
        <Box mr={2} className="start-time inline-flex align-items__center">
          {moment.unix(bet.startTime).format('DD/MM/YYYY HH:mm')}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="results inline-flex align-items__center justify-content__center">
          {`${bet.homeTeamGoals} : ${bet.awayTeamGoals}`}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="teams inline-flex align-items__center">
          {`${bet.homeTeam} : ${bet.awayTeam}`}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="stake inline-flex align-items__center">
          {bet.stake}
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          variant="fullWidth"
          className="divider__light"
        />
        <Box mx={2} className="actions inline-flex align-items__center">
          <Button onClick={handleBetClick('home')} disabled={isGameFinished}>Home Team Wins</Button>
          <Button onClick={handleBetClick('away')} disabled={isGameFinished}>Away Team Wins</Button>
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