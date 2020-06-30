import { Bet as BetConstants } from '../constants';

export default {
  GAME_DURATION: 120,
  RELOAD_BETS: 60000,
  PER_PAGE: 5,
  GameStatus: [
    {
      label: 'Active Games',
      value: BetConstants.Status.ACTIVE,
      default: true,
    },
    {
      label: 'Currently Playing',
      value: BetConstants.Status.PLAYING,
      default: false,
    },
    {
      label: 'Ended Games',
      value: BetConstants.Status.ENDED,
      default: false,
    }
  ],
};
