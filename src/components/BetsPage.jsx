import React, { useEffect, useState } from 'react';
import moment from 'moment';
import web3 from '../ethereum/web3';
import GameBetContract from '../ethereum/gameBet';
import FootballGameBetContract from '../ethereum/footballGameBet';
import { Box, Tab, Tabs, Backdrop, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Bet from './BetsPage/Bet';
import { Header } from './BetsPage/index';

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

const BetsPage = () => {
  const [bets, setBets] = useState([]);
  const [account, setAccount] = useState();
  const [organisators, setOrganisatiors] = useState();
  const [ratings, setRatings] = useState({});
  const [gameState, setGameState] = useState("active");
  const [filteredBets, setFilteredBets] = useState();
  const [showOverlayLoader, setShowOverlayLoader] = useState(false);
  const classes = useStyles();
  
  const getBetsByStatus = (status) => {
    let result = [];
    const currentTime = moment().unix();
    if (status === 'active' && bets) {
      result = bets.filter(bet => Number(bet.startTime) > currentTime) || [];
    } else if (status === 'playing' && bets) {
      result = bets.filter(bet => Number(bet.startTime) < currentTime && Number(bet.startTime) + 3600 > currentTime) || [];
    } else if (status === 'finished' && bets) {
      result = bets.filter(bet => Number(bet.startTime) < currentTime) || [];
    }

    setFilteredBets(result);
  }

  useEffect(() => {
    async function fetchData() {
      const gameBets = GameBetContract();
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const createdBets = await gameBets.methods.getBets().call({ from: accounts[0] });
      let _bets = await Promise.all(
        Array(createdBets.length).fill().map(async (element, index) => {
          const footballGameBetInstance = FootballGameBetContract(createdBets[index]);
          let gameBet = {
            address: createdBets[index],
          };
          await Promise.all(
            gameBet['homeTeam'] = await footballGameBetInstance.methods.homeTeam().call(),
            gameBet['homeTeamGoals'] = await footballGameBetInstance.methods.homeTeamGoals().call(),
            gameBet['awayTeam'] = await footballGameBetInstance.methods.awayTeam().call(),
            gameBet['awayTeamGoals'] = await footballGameBetInstance.methods.awayTeamGoals().call(),
            gameBet['startTime'] = await footballGameBetInstance.methods.startTime().call(),
            gameBet['organiser'] = await footballGameBetInstance.methods.organiser().call(),
            gameBet['stake'] = await footballGameBetInstance.methods.stake().call(),
            gameBet['balance'] = await web3.eth.getBalance(createdBets[index]),
            gameBet['hasVoted'] = await gameBets.methods.hasVoted(gameBet.organiser, gameBet.address, accounts[0]).call(),
          );

          return gameBet;
        })
      );

      setBets(_bets);

      const _organisers = await gameBets.methods.getOrganisers().call();
      setOrganisatiors(_organisers);

      _organisers.forEach(async (o, index) => {
        const _rate = await gameBets.methods.ratings(o).call();
        setRatings({ ...ratings, [o]: _rate });
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (bets) {
      getBetsByStatus(gameState);
    }
  }, [bets]);

  const handleGameStateChange = async (event, newActiveItem) => {
    await setGameState(newActiveItem);
    await getBetsByStatus(newActiveItem);
  };

  return (
    <div className="bet-summary__wrapper">
      <Backdrop className={classes.backdrop} open={showOverlayLoader}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box mt={3}>
        <Tabs
          orientation="vertical"
          className="tabs tabs__verical"
          onChange={handleGameStateChange}
          aria-label="Vertical tabs example"
          value={gameState}
        >
          <Tab className="bet-summary__tabs" label="Active Games" value="active" />
          <Tab className="bet-summary__tabs" label="Currently Playing" value="playing" />
          <Tab className="bet-summary__tabs" label="Finished Games" value="finished" />
        </Tabs>
      </Box>
      <Box className="flex-1" mt={3}>
        <Header />
        <Box>
          {filteredBets?.map(bet => (
            <Bet
              key={bet.address}
              data={bet}
              account={account}
              setShowOverlayLoader={setShowOverlayLoader}
            />
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default BetsPage;