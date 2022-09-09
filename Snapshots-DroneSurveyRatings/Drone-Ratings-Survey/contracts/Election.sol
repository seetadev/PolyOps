pragma solidity ^0.4.2;

contract Election{
    //Model a Candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
        uint sum;
    }
    //Store Candidates
    //Fetch Candidates
    mapping(uint => Candidate) public candidates;
    //Store Candidates Count
    uint public candidatesCount;

    //voted event
    event votedEvent (
        uint indexed _candidateID
    );

    function Election () public {
        addCandidate("Drone 1");
        addCandidate("Drone 2");
    }

    function addCandidate (string _name) private{
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, 0);
    }

    function vote(uint _candidateID, uint _rating) public {
        //require a valid candidate
        require(_candidateID > 0 && _candidateID <= candidatesCount);
       	candidates[_candidateID].voteCount = candidates[_candidateID].voteCount + 1;
	candidates[_candidateID].sum = candidates[_candidateID].sum + _rating;
        //trigger voted voted
        votedEvent(_candidateID);
    }
}
