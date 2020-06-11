import React, { useEffect, useState } from 'react';
import { Box} from '@material-ui/core';
import Bet from './Bet';

const BetsPage = () => {
  const [bets, setBets] = useState([]);

  useEffect(() => {
    // TODO: Replace mock data with real one and set bets
    setBets([
      {
        address: '0987773',
        organiser: '12535326462',
        homeTeam: 'Team1',
        awayTeam: 'Team2',
        stake: '1ETH',
        homeTeamGoals: '-',
        awayTeamGoals: '-',
        startTime: '16:00 07.06.2020'
      },
      {
        address: '98765',
        organiser: '9277425323252364',
        homeTeam: 'Team3',
        awayTeam: 'Team4  ',
        stake: '2ETH',
        homeTeamGoals: '-',
        awayTeamGoals: '-',
        startTime: '11:00 07.06.2020'
      }
    ]);
  }, []);

  return (
    <Box mt={3}>
      {bets.map(bet => (<Bet key={bet.address} data={bet} />))}
    </Box>
  );
};

export default BetsPage;