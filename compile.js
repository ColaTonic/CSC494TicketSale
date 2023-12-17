const path = require('path');
const fs = require('fs');
const solc = require('solc');

const tsPath = path.resolve(__dirname, 'contracts', 'TicketSale.sol');
const source = fs.readFileSync(tsPath, 'utf8');
//console.log(source);

let input = {
    language: "Solidity",
    sources: {
        "TicketSale.sol": {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["abi", "evm.bytecode"],
            },
        },
    },
};
//console.log(JSON.stringify(input))
console.log(solc.compile(JSON.stringify(input)));
const output = JSON.parse(solc.compile(JSON.stringify(input)));
//console.log(output);
//console.log(output.contracts["TicketSale.sol"].TicketSale);
const contracts = output.contracts["TicketSale.sol"];
const contract = contracts['TicketSale'];
//console.log(contract);
console.log(JSON.stringify(contract.abi));
module.exports = { "abi": contract.abi, "bytecode": contract.evm.bytecode.object };
