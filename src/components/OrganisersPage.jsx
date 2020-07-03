import React, { useState, useEffect } from 'react';
import Spinner from 'react-spinkit';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import { Alert, Rating } from '@material-ui/lab';
import GameBetContract from '../ethereum/gameBet';
import FootballGameBetContract from '../ethereum/footballGameBet';

const OrganisersPage = () => {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const gameBets = GameBetContract();

  const loadOrganisers = async () => {
    try {
      const _organisers = await gameBets.methods.getOrganisers().call();
      return _organisers;
    } catch (err) {
      throw new Error('Error occured while loading organisers.');
    }
  };

  const loadRatings = async (organisers) => {
    try {
      const _ratings = await Promise.all(
        organisers.map(async (o) => {
          const _rate = await gameBets.methods.ratings(o).call();
          return {
            organiser: o,
            active: _rate.active,
            numberOfTimesRated: _rate.numberOfTimesRated,
            totalRate: _rate.totalRate,
          };
        })
      );
      return _ratings;
    } catch (err) {
      throw new Error('Error occured while loading ratings.');
    }
  };

  const loadBets = async () => {
    try {
      const createdBets = await gameBets.methods.getBets().call();
      const _bets = await Promise.all(
        Array(createdBets.length).fill().map(async (element, index) => {
          const _address = createdBets[index];
          const footballGameBetInstance = FootballGameBetContract(_address);
          const org = await footballGameBetInstance.methods.organiser().call();
          return {
            address: _address,
            organiser: org,
          };
        }));
      return _bets;
    } catch (err) {
      throw new Error('Error occured while loading bets.');
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const _organisers = await loadOrganisers();
        const _ratings = await loadRatings(_organisers);
        const _bets = await loadBets();
        _ratings.forEach(rate => {
          const betsCreated = _bets.filter(b => b.organiser === rate.organiser);
          rate.betsCreated = betsCreated.length;
        });

        await setData(_ratings);
      } catch (err) {
        setError(err.message);
      }

      await setLoading(false);
    }

    loadData();
  }, []); 

  return (
    <>
      <Box mt={6}>
        {loading && (
          <div className="loading">
            <Spinner name="ball-pulse-sync" />
          </div>
        )}
        {error && !loading (
          <Alert severity="error" className="alert">
            {error}
          </Alert>
        )}
        {data && !loading && !error && (
          <TableContainer component={Paper}>
            <Table className="organisers" aria-label="organisers">
              <TableHead>
                <TableRow>
                  <TableCell className="fw-600 ls-1">Organiser</TableCell>
                  <TableCell align="right" className="fw-600 ls-1">Bets Created</TableCell>
                  <TableCell align="right" className="fw-600 ls-1">Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.organiser}>
                    <TableCell component="th" scope="row">
                      {row.organiser}
                    </TableCell>
                    <TableCell align="right">{row.betsCreated}</TableCell>
                    <TableCell align="right" className="table__rate">
                      <span className="ml8">{` (${row.numberOfTimesRated})`}</span>
                      <Rating
                        name={`rate-${row.organiser}}`}
                        value={Number(Math.round(row.totalRate/row.numberOfTimesRated))}
                        precision={1}
                        readOnly
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
};

export default OrganisersPage;