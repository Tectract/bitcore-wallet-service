'use strict';

var $ = require('preconditions').singleton();
var _ = require('lodash');
var util = require('util');

var Uuid = require('uuid');

var Address = require('./address');
var AddressManager = require('./addressmanager');
var WalletUtils = require('bitcore-wallet-utils');
var Bitcore = WalletUtils.Bitcore;
var HDPublicKey = Bitcore.HDPublicKey;

function Copayer() {
  this.version = '1.0.0';
};


// requestPubKey could be one or an array of keys
Copayer.create = function(opts) {
  opts = opts || {};
  $.checkArgument(opts.xPubKey, 'Missing copayer extended public key');
  $.checkArgument(opts.requestPubKey, 'Missing copayer request public key');

  opts.copayerIndex = opts.copayerIndex || 0;

  var x = new Copayer();
  x.createdOn = Math.floor(Date.now() / 1000);

  x.xPubKey = opts.xPubKey;

  x.id = WalletUtils.xPubToCopayerId(x.xPubKey);
  x.name = opts.name;
  x.signature = opts.signature; // So third parties can check independently
  x.requestPubKey = opts.requestPubKey;
  x.addressManager = AddressManager.create({
    copayerIndex: opts.copayerIndex
  });
  x.isTemporaryRequestKey = opts.isTemporaryRequestKey || false;

  return x;
};

Copayer.fromObj = function(obj) {
  var x = new Copayer();

  x.createdOn = obj.createdOn;
  x.id = obj.id;
  x.name = obj.name;
  x.xPubKey = obj.xPubKey;
  x.requestPubKey = obj.requestPubKey;
  x.signature = obj.signature;
  x.isTemporaryRequestKey = obj.isTemporaryRequestKey;

  x.addressManager = AddressManager.fromObj(obj.addressManager);

  return x;
};

Copayer.prototype.createAddress = function(wallet, isChange) {
  $.checkState(wallet.isComplete());

  var path = this.addressManager.getNewAddressPath(isChange);
  var raw = Address.create(WalletUtils.deriveAddress(wallet.publicKeyRing, path, wallet.m, wallet.network));
  var address = Address.create(_.extend(raw, {
    walletId: wallet.id,
  }));

  address.isChange = isChange;
  return address;
};

module.exports = Copayer;
