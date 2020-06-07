pragma solidity  >=0.4.22 <0.7.0;

import "./FootballGameBet.sol";

contract GameBet{
    struct Organiser {
        bool active;
        uint totalRate;
        uint numberOfTimesRated;
    }
    address[] public organisers;
    mapping(address => Organiser) public ratings;
    mapping(address => mapping(address => mapping(address => bool))) public hasVoted;
    
    address[] public allBets;
    
    function createFootballBet(string memory homeTeam, string memory awayteam, uint starttime, uint stake) public {
        FootballGameBet newBet = new FootballGameBet(homeTeam, awayteam, starttime, stake, msg.sender);
        allBets.push(address(newBet));
        
        if(!ratings[msg.sender].active){
            ratings[msg.sender].active = true;
            organisers.push(msg.sender);
        }
    }
    
    function getBets() public view returns(address[] memory) {
        return allBets;
    }
    
    function getOrganisers() public view returns(address[] memory){
        return organisers;
    }
    
    function canVote(address organiser, address bet) public view returns(bool){
        if(msg.sender == organiser)
            return false;
        if(!ratings[organiser].active)
            return false;
        if(now < FootballGameBet(bet).startTime())
            return false;
        if(FootballGameBet(bet).organiser() != organiser)
            return false;
        if(FootballGameBet(bet).bets(msg.sender) == 0)
            return false;
        if(hasVoted[organiser][bet][msg.sender])
            return false;
        return true;
    }
    
    function vote(address organiser, address bet, uint8 rate) public {
        require(rate <= 5, "Rate can't be over 5.");
        require(rate >= 0, "Rate can't be lower than 0.");
        require(canVote(organiser, bet), "You can't vote.");
        hasVoted[organiser][bet][msg.sender] = true;
        ratings[organiser].totalRate += rate;
        ratings[organiser].numberOfTimesRated++;
    }
}