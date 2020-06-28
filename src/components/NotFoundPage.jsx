import React from 'react';
import { Link } from 'react-router-dom';
import { RoutePaths } from '../constants';

const NotFoundPage = () => (
  <div className="not-found">
    <img src="/illustrations/page-not-found.svg" alt="Page Not Found" />
    <Link className="button" to={RoutePaths.BETS}>Go Back</Link> 
  </div>
);

export default NotFoundPage;