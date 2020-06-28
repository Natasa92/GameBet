pragma solidity  >=0.4.22 <0.7.0;

contract FootballGameBet {
    string public homeTeam;
    uint8 public homeTeamGoals;
    string public awayTeam;
    uint8 public awayTeamGoals;
    uint public startTime;
    
    address payable public organiser;
    uint public stake;
    
    // Address of player and his choice (1-home or 2-away)
    mapping(address => uint) public bets;
    address payable[] public players;
    
    constructor(string memory hometeam, string memory awayteam, uint starttime, uint stakeLimit, address payable organiserAddress) public {
        require(starttime > now, "Invalid game start time.");
        require(bytes(hometeam).length > 0, "Home team name can't be empty.");
        require(bytes(awayteam).length > 0, "Away team name can't be empty.");
        require(stakeLimit > 0, "Stake value can't be 0.");
        homeTeam = hometeam;
        awayTeam = awayteam;
        startTime = starttime;
        organiser = organiserAddress;
        stake = stakeLimit;
    }
    
    function betOnHomeTeam() public payable canPlaceBet isGameFinished isStakeValid {
        if(bets[msg.sender] == 0){
            players.push(msg.sender);
        }
        
        bets[msg.sender] = 1;
    }
    
    function betOnAwayTeam() public payable canPlaceBet isGameFinished isStakeValid {
        if(bets[msg.sender] == 0){
            players.push(msg.sender);
        }
        
        bets[msg.sender] = 2;
    }
    
    function getAllPlayers() public view returns(address payable[] memory){
        return players;
    }
    
    function gameFinished(uint8 homeGoals, uint8 awayGoals) public isContractBalanceValid isOrganiser {
        homeTeamGoals = homeGoals;
        awayTeamGoals = awayGoals;
        
        uint8 winner = 0;
        uint winningAmount = players.length*stake;
        uint organiserFee = 0;
        
        if(homeGoals > awayGoals){
            winner = 1;
            organiserFee = (winningAmount * 5) / 100;
            winningAmount -= organiserFee;
        } else if(awayGoals > homeGoals){
            winner = 2;
            organiserFee = (winningAmount * 5) / 100;
            winningAmount -= organiserFee;
        }
        
        if(winner == 0){
            for(uint i = 0; i < players.length; i++){
                players[i].transfer(stake);
            }
        } else {
            uint numOfWinners = 0;
            
            for(uint i = 0; i < players.length; i++){
                if(bets[players[i]] == winner){
                    numOfWinners++;
                }
            }
            
            uint amountByWinner = winningAmount / numOfWinners;
            
            for(uint i = 0; i < players.length; i++){
                if(bets[players[i]] == winner){
                    players[i].transfer(amountByWinner);
                }
            }
            
            organiser.transfer(address(this).balance);
        }
    }
    
    // MODIFIERS
    modifier isContractBalanceValid() {
        require(address(this).balance > 0, "Balance of this contract is 0.");
        _;
    }
    
    modifier isOrganiser() {
        require(msg.sender == organiser, "You are not organiser of the bet.");
        _;
    }
    
    modifier canPlaceBet() {
        require(bets[msg.sender] == 0, "You've already placed a bet.");
        _;
    }
    
    modifier isGameFinished() {
        require(now <= startTime);
        _;
    }
    
    modifier isStakeValid(){
        require(msg.value == stake, "Invalid stake amout.");
        _;
    }
}