pragma solidity ^0.4.0;

import "./mortal.sol";

contract MyWallet is mortal {
	
	event receivedFunds(address indexed _from, uint256 _amount);
	event proposalReceived(address indexed _from, address indexed _to, string _reason);
	event sendmsg(string message);

	struct Proposal {
		address _from;
		address _to;
		uint256 _value;
		string _reason;
		bool sent;
	}

	uint proposal_counter;

	mapping(uint => Proposal) m_proposals;

	function spendMoneyOn(address _to, uint256 _value, string _reason) returns (uint256) {
		if (owner == msg.sender) {
			bool sent = _to.send(_value);
			if(!sent) {
				sendmsg('Send failure...');
			} else {
			    sendmsg('Send success!');
			}
		} else {
			proposal_counter++;
			m_proposals[proposal_counter] = Proposal(msg.sender, _to, _value, _reason, false);
			proposalReceived(msg.sender, _to, _reason);
			sendmsg('Proposal received and under review...');
			return proposal_counter;
		}	
	}
	
	function confirmProposal(uint proposal_id) onlyowner returns (bool) {
	    Proposal proposal = m_proposals[proposal_id];
	    if(proposal._from != address(0)) {
	        if(proposal.sent != true) {
	            proposal.sent = true;
	            if(proposal._to.send(proposal._value)) {
	                sendmsg('Proposal confirmed and ether sent!');
	                return true;
	            }
    	        proposal.sent = false;
    	        sendmsg('Proposal cannot be completed...');
    	        return false;
	        } else {
	            sendmsg('Proposal already completed...');
	        }
	    }
	}

	function() payable {
		if(msg.value > 0) {
			receivedFunds(msg.sender, msg.value);
		}
	}

}