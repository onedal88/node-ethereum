#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

var Ethereum = require('../'),
  async = require('async'),
  Network = Ethereum.Network,
  DB = Ethereum.DB,
  Blockchain = Ethereum.Blockchain,
  db = DB.db,
  internals = {};

internals.blockchain = new Blockchain(db);
internals.transactions = [];

internals.network = new Network({
  publicIp: argv["public-ip"]
});

internals.network.on('connecting', function (socket, port, host) {
  console.log(host + ":" + port + ' connecting');
});

internals.network.on('closing', function (peer) {
  console.log(peer.internalId + " closing");
});

internals.network.on('message.hello', function (hello) {
  console.log(hello.ip + ":" + hello.port + " hello");
});

internals.network.on('message.transactions', function (transactions, peer) {
  internals.transactions.concat(transactions);
  console.log(peer.internalId + ' got transactions');
  //TODO: check if transaction is in the DB
  //check if the transaction is valid
  //push tx to txlist
  //save in db
});

internals.network.on('message.peers', function (peers, peer) {
  console.log(peers);
  console.log(peer.internalId + ' got peers');
});

internals.network.on('message.getPeers', function (peers, peer) {
  console.log(peer.internalId + ' got get peers');
});

internals.network.on('message.blocks', function (blocks, peer) {
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    internals.blockchain.addBlock(blocks[i]);
  }
  console.log(peer.internalId + ' got blocks');
});

internals.network.on('message.getChain', function (message, peer) {
  console.log(peer.internalId + " got get chain");
});

internals.network.on('message.notInChain', function (message, peer) {
  console.log(peer.internalId + ' got not in chain');
});

internals.network.on('message.getTransactions', function (message, peer) {
  console.log(peer.internalId + ' got request for transactions');
});

internals.network.on('message.disconnect', function (message, peer) {
  console.log(peer.internalId + ' got disconnected:' + message.reason);
});

internals.network.listen(30303, "0.0.0.0");
//internals.network.connect(30303, "54.204.10.41");
