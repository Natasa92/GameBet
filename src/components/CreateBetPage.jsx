import React, { useState } from 'react';
import { TextField, Button, Box } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles';
import { spacing } from '@material-ui/system';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
  },
}));

const CreateBetPage = () => {
  const classes = useStyles();
  const [data, setData] = useState({
    homeTeam: '',
    awayTeam: '',
    startTime: '',
    stake: '',
  });
  const [formError, setFormError] = useState();

  const handleChange = event => {
    const { id, value } = event.target;
    
    if (formError) {
      setFormError(null);
    }

    setData({ ...data, [id]: value });
  };

  const handleOnSubmit = () => {};

  // TODO: Set datetime picker to the current time

  return (
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
        <TextField
          id="startTime"
          label="Game start's at"
          type="datetime-local"
          defaultValue="2017-05-24T10:30"
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          required
          id="stake"
          label="Stake"
          value={data.stake}
          onChange={handleChange}
          placeholder="Stake"
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" color="primary" className="mt24" type="submit">
          Create Bet
        </Button>
      </form>
    </Box>
  );
}

export default CreateBetPage;