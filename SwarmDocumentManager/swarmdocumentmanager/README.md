# Ethereum Document Management

This document management is based upon Ethereum Smart Contracts and Swarm.
Documents are added to the distributed file storage solution Swarm and the hashes of those documents will be added with a description to a smart contract on the Ethereum network.

## Installation

### Part 1

1. `git clone https://github.com/froid1911/eth-swarm-example.git`
2. `cd eth-swarm-example`
3. `npm install`

### Part 2
For the second part, be sure you're connected to an Ethereum client and Ethereum Swarm Client before running the commands below. 
You can find an Docker here, if you are new to Ethereum: https://github.com/froid1911/ethereum-docker

And then in the original tab, run:

4. `truffle compile` to compile your contracts
5. `truffle migrate` to deploy those contracts to the network
6. `ng serve`. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
7. Make sure there are no errors in browser console

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Technologies & Languages Used
1. Angular4 (Typescript/Javascript)
2. Truffle (Solidity)
