import React from 'react';
import { ExpansionPanel, ExpansionPanelSummary, Divider, Box } from '@material-ui/core';

const Header = () => (
  <ExpansionPanel disabled>
    <ExpansionPanelSummary className="bet-summary bet-summary__header">
      <Box mr={2} className="start-time inline-flex align-items__center">
        Game Starts
      </Box>
      <Divider
        orientation="vertical"
        flexItem
        variant="fullWidth"
        className="divider__light"
      />
      <Box mx={2} className="results inline-flex align-items__center justify-content__center">
        Results
      </Box>
      <Divider
        orientation="vertical"
        flexItem
        variant="fullWidth"
        className="divider__light"
      />
      <Box mx={2} className="teams inline-flex align-items__center">
        Home Team : Away Team
      </Box>
      <Divider
        orientation="vertical"
        flexItem
        variant="fullWidth"
        className="divider__light"
      />
      <Box mx={2} className="stake inline-flex align-items__center">
        Stake
      </Box>
      <Divider
        orientation="vertical"
        flexItem
        variant="fullWidth"
        className="divider__light"
      />
      <Box mx={2} className="actions inline-flex align-items__center"></Box>
    </ExpansionPanelSummary>
  </ExpansionPanel>
);

export default Header;