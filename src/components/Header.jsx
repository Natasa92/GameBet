import React, { useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { AppBar, Tabs, Tab } from '@material-ui/core';
import { MenuItems } from '../config';

const Header = ({ location }) => {
  const [activeItem, setActiveItem] = useState(MenuItems.find(item => item.route === location.pathname)?.name);

  const handleChange = (event, newActiveItem) => { setActiveItem(newActiveItem); };

  return (
    <AppBar position="static">
      <div className="logo">
        <img src='/logo.svg' alt="logo" />
      </div>
      <Tabs
        value={activeItem}
        onChange={handleChange}
        aria-label="nav tabs"
        className="tabs"
      >
        {MenuItems.map(item => (
          <Tab
            key={item.name}
            component={Link}
            to={item.route}
            label={item.label}
            value={item.name}
          />
        ))}
      </Tabs>
    </AppBar>
  );
};

export default withRouter(Header);