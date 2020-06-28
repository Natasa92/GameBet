import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { RoutePaths } from '../constants';

const Footer = () => (
  <div className="footer">
    <div className="logo">
      <img src='/logo.svg' alt="logo" />
    </div>
    <Grid container justify={"center"} spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Typography align={"center"} gutterBottom>
          <Link to={RoutePaths.BETS}>Bets</Link>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Typography align={"center"} gutterBottom>
          <a href="https://github.com/Natasa92/GameBet" target="_blank">Repository</a>
        </Typography>
      </Grid>
    </Grid>
    <Divider className="footer__divider" />
    <Typography variant="caption" align={"center"}>
      {`© Copyright ${moment().year()}`}
    </Typography>
  </div>
);

export default Footer;
