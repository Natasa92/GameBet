import React, { useState } from 'react';
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

const BetDetails = ({ data: bet }) => {
  const [rate, setRate] = useState(0);
  const [goals, setGoals] = useState({ home: '', away: '' });
  const [goalsError, setGoalsError] = useState({ home: null, away: null });
  const [saveGoalsButtonDisabled, setSaveGoalsButtonDisabled] = useState(true);
  const [voteButtonDisabled, setVoteButtonDisabled] = useState(true);

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
    if (value > 0) {
      setVoteButtonDisabled(false);
    } else {
      setVoteButtonDisabled(true);
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

  const handleVoteClick = () => {};
  const handleResultSubmit = () => {};
  const handleBetClick = (team) => (event) => {};

  return (
    <ExpansionPanel key={bet.address}>
      <ExpansionPanelSummary
        aria-controls={bet.address}
        id={bet.address}
        className="bet-summary"
      >
        <Box mr={2} className="start-time inline-flex align-items__center">
          {bet.startTime}
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
          <Button onClick={handleBetClick('home')}>Home Team Wins</Button>
          <Button onClick={handleBetClick('away')}>Away Team Wins</Button>
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
            {/* TODO: Show rate only when the game is over and the user is not organisator */}
            <Rating
              name={`rate-${bet.organiser}`}
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
          </Box>
          {/* TODO: Show enter game result after the game is over and if user is the organisator */}
          <Box mt={4}>
            <form onSubmit={handleResultSubmit} className="results-form">
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
                type="submit"
              >
                Save
              </Button>
            </form>
          </Box>
        </Box>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default BetDetails;