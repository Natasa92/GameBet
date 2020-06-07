import React, { useState } from 'react';
import { Menu } from 'semantic-ui-react';
import { withRouter, Link } from 'react-router-dom';
import { MenuItems, Styles } from '../config';

const Header = ({ location }) => {
  const [activeItem, setActiveItem] = useState(MenuItems.find(item => item.route === location.pathname)?.name);

  const handleItemClick = (e, {name}) => setActiveItem(name);

  return (
    <div style={Styles.MENU}>
      <img style={Styles.LOGO} src='/logo.svg' />

      <Menu pointing secondary>
        {MenuItems.map(item => (
          <Menu.Item
            key={item.name}
            as={Link}
            to={item.route}
            name={item.name}
            active={activeItem === item.name}
            onClick={handleItemClick}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default withRouter(Header);