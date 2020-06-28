import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { Box, Tab, Tabs, Backdrop } from '@material-ui/core';
import { Alert, Pagination } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import Spinner from 'react-spinkit';
import web3 from '../ethereum/web3';
import GameBetContract from '../ethereum/gameBet';
import FootballGameBetContract from '../ethereum/footballGameBet';
import { Bet as BetConstants, RoutePaths } from '../constants';
import { BetConfig } from '../config';
import { createRoute, getParams } from '../helpers';
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
  },
}));

const BetsPage = ({ account, getAccount, location, history }) => {
  const classes = useStyles();
  const activeGameStatus = BetConfig.GameStatus.find(status => status.default)?.value;
  const [bets, setBets] = useState();
  const [gameState, setGameState] = useState(activeGameStatus);
  const [filteredBets, setFilteredBets] = useState();
  const [showOverlayLoader, setShowOverlayLoader] = useState(false);
  const [error, setError] = useState();
  const [loadingData, setLoadingData] = useState(false);
  const [paging, setPaging] = useState({ currentPage: 1, totalNumberOfPages: 1 });
  const gameBets = GameBetContract();
  let timer = null;

  const filterBets = (status, page) => {
    let result = [];
    const currentTime = moment().unix();

    if (status === BetConstants.Status.ACTIVE && bets) {
      result = bets.filter(bet => Number(bet.startTime) > currentTime) || [];
    } else if (status === BetConstants.Status.PLAYING && bets) {
      result = bets.filter(bet => (
        Number(bet.startTime) < currentTime && Number(bet.startTime) + BetConfig.GAME_DURATION > currentTime
      )) || [];
    } else if (status === BetConstants.Status.ENDED && bets) {
      result = bets.filter(bet => Number(bet.startTime) + BetConfig.GAME_DURATION < currentTime) || [];
    }

    const startIndex = (page - 1) * BetConfig.PER_PAGE;
    const endIndex = page * BetConfig.PER_PAGE;
    const _totalPages = Math.ceil(result.length / BetConfig.PER_PAGE);
    setPaging({ currentPage: page, totalNumberOfPages: _totalPages });

    const finalResult = result.slice(startIndex, endIndex);
    setFilteredBets(finalResult);
  }

  const loadBets = async (acc) => {
    try {
      const createdBets = await gameBets.methods.getBets().call();
      const _bets = await Promise.all(
        Array(createdBets.length).fill().map(async (element, index) => {
          const _address = createdBets[index];
          const footballGameBetInstance = FootballGameBetContract(_address);
          const gameBet = { address: _address };

          await Promise.all(
            gameBet['homeTeam'] = await footballGameBetInstance.methods.homeTeam().call(),
            gameBet['homeTeamGoals'] = await footballGameBetInstance.methods.homeTeamGoals().call(),
            gameBet['awayTeam'] = await footballGameBetInstance.methods.awayTeam().call(),
            gameBet['awayTeamGoals'] = await footballGameBetInstance.methods.awayTeamGoals().call(),
            gameBet['startTime'] = await footballGameBetInstance.methods.startTime().call(),
            gameBet['organiser'] = await footballGameBetInstance.methods.organiser().call(),
            gameBet['stake'] = await footballGameBetInstance.methods.stake().call(),
            gameBet['betOn'] = await  footballGameBetInstance.methods.bets(acc).call(),
            gameBet['balance'] = await web3.eth.getBalance(_address),
            gameBet['hasVoted'] = await gameBets.methods.hasVoted(gameBet.organiser, gameBet.address, acc).call(),
          );

          return gameBet;
        })
      );

      await setBets(_bets);
      return _bets;
    } catch (err) {
      throw new Error('Something went wrong while loading game bets.');
    }
  };

  const reloadBets = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    const _account = await getAccount();

    if (_account) {
      try {
        await loadBets(_account);
        timer = setTimeout(reloadBets, BetConfig.RELOAD_BETS);
      } catch (err) {
        await setError(err.message);
      }
    }
  };

  const loadData = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    await setLoadingData(true);
    const _account = await getAccount();
    
    if (_account) {
      try {
        await loadBets(_account);
        timer = setTimeout(reloadBets, BetConfig.RELOAD_BETS);
      } catch (err) {
        await setError(err.message);
      }
    }

    await setLoadingData(false);
  };

  useEffect(() => {
    async function fetchData() {
     await loadData();
    };

    fetchData();

    const params = getParams(location.search);
    if (params.status) {
      setGameState(params.status);
    }

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (bets) {
      filterBets(gameState, paging.currentPage);
    }
  }, [bets]);

  const clearTimer = () => {
    if (timer) {
      clearTimer(timer);
    }
  };

  const handleGameStatusChange = (event, newActiveItem) => {
    setLoadingData(true);
    setGameState(newActiveItem);
    filterBets(newActiveItem, 1);
    setLoadingData(false);
    history.push(createRoute(RoutePaths.BETS, { status: newActiveItem }));
  };

  const handleChangePage = (event, page) => {
    filterBets(gameState, page);
  };

  return (
    <div className="bet-summary__wrapper">
      <Backdrop className={`${classes.backdrop} overlay`} open={showOverlayLoader}>
        <Spinner name="ball-pulse-sync" />
      </Backdrop>
      <Box className="bet-summary__tabs-wrap" mt={3}>
        <Tabs
          orientation="vertical"
          className="tabs tabs__verical"
          onChange={handleGameStatusChange}
          aria-label="Game Status"
          value={gameState}
        >
          {BetConfig.GameStatus.map((status, index) => (
            <Tab key={`${index + 1}`} className="bet-summary__tabs" label={status.label} value={status.value} />
          ))}
        </Tabs>
        <img src="/illustrations/fans.svg" alt="Fans" />
      </Box>
      <div className="bet-summary__content">
        {loadingData && (
          <div className="loading mt84">
            <Spinner name="ball-pulse-sync" />
          </div>
        )}
        {error && !loadingData && (
          <Box className="flex-1" mt={3}>
            <Alert severity="error" className="alert mt24">
              {error}
            </Alert>
          </Box>
        )}
        {filteredBets && !loadingData && !error && filteredBets.length > 0 && (
          <Box className="flex-1" mt={3}>
            <Header />
            <Box>
              {filteredBets.map(bet => (
                <Bet
                  key={bet.address}
                  data={bet}
                  account={account}
                  getAccount={getAccount}
                  reloadBets={reloadBets}
                  setShowOverlayLoader={setShowOverlayLoader}
                  clearTimer={clearTimer}
                />
              ))}
            </Box>
            {paging.totalNumberOfPages > 1 && (
              <Pagination
                className="pagination"
                count={paging.totalNumberOfPages}
                onChange={handleChangePage}
                page={paging.currentPage}
                showFirstButton
                showLastButton
              />
            )}
          </Box>
        )}
        {!loadingData && !error && filteredBets?.length === 0 && (
          <Box className="flex-1" mt={3}>
            <div className="bet-summary__no-data">
              <img src="/illustrations/no-data.svg" alt="No data" />
              <p>No bets to display</p>
            </div>
          </Box>
        )}
      </div>
    </div>
  );
};

export default withRouter(BetsPage);