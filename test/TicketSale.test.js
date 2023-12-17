const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const { abi, bytecode } = require('../compile');

let accounts;
let TicketSale_instance;

describe("TicketSale deploys", () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();

        TicketSale_instance = await new web3.eth.Contract(abi)
            .deploy({ data: bytecode, arguments: [10, 15] })
            .send({ from: accounts[0], gasPrice: 8000000000, gas: 4700000 });

    });

    it("deploys", async () => {
        console.log(accounts);
        assert.ok(TicketSale_instance.options.address)

        const ownerAddress = await TicketSale_instance.methods.owner().call();
        assert.equal(ownerAddress, accounts[0]);
    });

    it("allows user to buy a ticket", async () => {
        await TicketSale_instance.methods.buyTicket(1).send({
            from: accounts[1],
            value: 15,
            gasPrice: 8000000000,
            gas: 4700000
        });
        const ticketOwner = await TicketSale_instance.methods.ticket_map(1).call();
        assert.equal(ticketOwner.owner, accounts[1], "ticket is not owned by expected address");
    })

    it("can see which ticket an address owns", async () => {
        await TicketSale_instance.methods.buyTicket(1).send({
            from: accounts[1],
            value: 15,
            gasPrice: 8000000000,
            gas: 4700000
        });

        const ticketID1 = await TicketSale_instance.methods.getTicketOf(accounts[1]).call({
            from: accounts[0],
            gasPrice: 8000000000,
            gas: 4700000
        });

        assert.equal(ticketID1, 1,"Ticket not owned by expected account");

        const ticketID2 = await TicketSale_instance.methods.getTicketOf(accounts[2]).call({
            from: accounts[0],
            gasPrice: 8000000000,
            gas: 4700000
        });

        assert.equal(ticketID2, 0,"Ticket not owned by expected account");
    })

    it("allows users to swap tickets with other users", async () => {
        await TicketSale_instance.methods.buyTicket(1).send({
            from: accounts[1],
            value: 15,
            gasPrice: 8000000000,
            gas: 4700000
        });

        await TicketSale_instance.methods.buyTicket(2).send({
            from: accounts[2],
            value: 15,
            gasPrice: 8000000000,
            gas: 4700000
        });

        let ticket1 = await TicketSale_instance.methods.ticket_map(1).call();
        let ticket2 = await TicketSale_instance.methods.ticket_map(2).call();

        assert.equal(ticket1.owner, accounts[1]);
        assert.equal(ticket2.owner, accounts[2]);
        assert.equal(ticket1.offer_partner, 0);
        assert.equal(ticket2.offer_partner, 0);

        await TicketSale_instance.methods.offerSwap(accounts[2]).send({
            from: accounts[1],
            gasPrice: 8000000000,
            gas: 4700000
        });

        ticket1 = await TicketSale_instance.methods.ticket_map(1).call();
        ticket2 = await TicketSale_instance.methods.ticket_map(2).call();

        assert.equal(ticket1.owner, accounts[1]);
        assert.equal(ticket2.owner, accounts[2]);
        assert.equal(ticket1.offer_partner, accounts[2]);
        assert.equal(ticket2.offer_partner, 0);

        await TicketSale_instance.methods.acceptSwap(accounts[1]).send({
            from: accounts[2],
            gasPrice: 8000000000,
            gas: 4700000
        });

        ticket1 = await TicketSale_instance.methods.ticket_map(1).call();
        ticket2 = await TicketSale_instance.methods.ticket_map(2).call();

        assert.equal(ticket1.owner, accounts[2]);
        assert.equal(ticket2.owner, accounts[1]);
        assert.equal(ticket1.offer_partner, 0);
        assert.equal(ticket2.offer_partner, 0);
    })

    it("allows user to return their ticket", async () => {
        await TicketSale_instance.methods.buyTicket(1).send({
            from: accounts[1],
            value: 15,
            gasPrice: 8000000000,
            gas: 4700000
        });

        const startAmount = BigInt(await web3.eth.getBalance(accounts[1]));

        await TicketSale_instance.methods.returnTicket(1).send({
            from: accounts[1],
            value: 15,
            gasPrice: 8000000000,
            gas: 4700000
        });

        ticket1 = await TicketSale_instance.methods.ticket_map(1).call();
        const endAmount = BigInt(await web3.eth.getBalance(accounts[1]));

        assert.equal(ticket1.owner, 0);
        assert.equal(endAmount > startAmount, true, "value of return was not refunded")

    })
})
