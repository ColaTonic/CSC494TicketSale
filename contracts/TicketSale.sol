pragma solidity ^0.8.17;

contract TicketSale {

	address public owner;
    uint public price;
    uint public numTickets;

    struct ticket {
        uint id;
        address owner;
		address offer_partner;
    }
	
    mapping(uint => ticket) public ticket_map;

	constructor(uint _numTickets, uint _price) public {
		owner = msg.sender;
        numTickets = _numTickets;
        price = _price;
		for (uint i = 1; i <= numTickets; i++){
			ticket_map[i] = ticket(i, address(0), address(0));
		}
	}

	function buyTicket(uint ticketId) public payable {
		require(ticket_map[ticketID].owner == address(0), "The selected ticket already has an owner");
        require(getTicketOf(msg.sender) == 0, "This address already owns a ticket");
        require(msg.value >= price, "Supplied amount insufficient to purchase");
        ticket_map[ticketId].owner = msg.sender;
        owner.call{value: price}("");
	}

	function getTicketOf(address person) public view returns (uint) {
        for (uint i = 1; i <= numTickets; i++){
            if (ticket_map[i].owner == person){
				return i;
			}
        } else {
			return 0;
		}
	}

	function offerSwap(address partner) public {
        uint senderID = getTicketOf(msg.sender);
		ticket_map[senderID].offer_partner = partner;
	}

	function acceptSwap(address partner) public {
        uint senderID = getTicketOf(partner);
		uint accepterID = getTicketOf(msg.sender);
		require(ticket_map[senderID].offer_partner == msg.sender,"Offer does not exist");
		ticket_map[senderID].offer_partner = address(0);
		ticket_map[senderID].owner = msg.sender;
		ticket_map[accepterID].owner = partner;
	}

	function returnTicket(uint ticketId){
		require(msg.sender == ticket_map[ticketId].owner, "Sender must own requested ticket");
        uint amount = price * 90 / 100;
        require(msg.value >= amount, "Not enough Wei");
        ticket_map[ticketId].owner = address(0);
        ticket_map[ticketId].owner.call{value: amount}("");
	}
}