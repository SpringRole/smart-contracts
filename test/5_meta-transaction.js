const Attestation = artifacts.require('Attestation');
const RelayHub = artifacts.require('RelayHub');
const VanityURL = artifacts.require('VanityURL');
const { RelayProvider } = require('tabookey-gasless');

const { expectEvent } = require('openzeppelin-test-helpers');
const relayHubAddr = '0x9C57C0F1965D225951FE1B2618C92Eefd687654F';

contract('Attestation & VanityURL (meta txns test)', function([
  _,
  anotherUser
]) {
  let attestationInstance;
  let gasless;
  let gasPrice;
  let relay_client_config;

  before(async function() {
    const gasPricePercent = 20;
    gasPrice = ((await web3.eth.getGasPrice()) * (100 + gasPricePercent)) / 100;
    gasless = await web3.eth.personal.newAccount('password');
    web3.eth.personal.unlockAccount(gasless, 'password');
    rhub = await RelayHub.at(relayHubAddr);
    attestationInstance = await Attestation.deployed();
    vanityInstance = await VanityURL.deployed();
  });

  describe('enable relay', function() {
    it('should be able to enable relay', async function() {
      relay_client_config = {
        txfee: 30,
        force_gasPrice: gasPrice, //override requested gas price
        force_gasLimit: 800000, //override requested gas limit.
        verbose: process.env.DEBUG
      };
      let relayProvider = await new RelayProvider(
        web3.currentProvider,
        relay_client_config
      );

      await Attestation.web3.setProvider(relayProvider);
      await VanityURL.web3.setProvider(relayProvider);
    });
  });

  describe('Attestation:', function() {
    it('should be able to send gasless tranasactions and emit Attest event', async function() {
      const { logs } = await attestationInstance.write(
        'some_type',
        'some_data',
        {
          from: gasless
        }
      );
      expectEvent.inLogs(logs, 'Attest', {
        _address: gasless,
        _type: 'some_type',
        _data: 'some_data'
      });
    });
  });

  describe('VanityURL:', function() {
    describe('reserve a Vanity url', function() {
      before(async function() {
        await vanityInstance.reserve('sr_user', 'srind1', { from: gasless });
      });

      it('Should be able to retrive the same wallet address', async function() {
        (await vanityInstance.retrieveWalletForVanity.call(
          'sr_user'
        )).should.equal(gasless);
      });

      it('Should be able to retrive the same Vanity', async function() {
        (await vanityInstance.retrieveVanityForWallet.call(
          gasless
        )).should.equal('sr_user');
      });

      it('Should be able to retrive the same springrole id', async function() {
        (await vanityInstance.retrieveSpringroleIdForVanity.call(
          'sr_user'
        )).should.equal('srind1');
      });

      it('Should be able to retrive the same Vanity', async function() {
        (await vanityInstance.retrieveVanityForSpringroleId.call(
          'srind1'
        )).should.equal('sr_user');
      });
    });

    describe('Change Vanity URL', function() {
      it('should be able to change Vanity url', async function() {
        await vanityInstance.changeVanityURL('nervehammer', 'srind2', {
          from: gasless
        });
      });

      it('Vanity url should be assigned to user', async function() {
        (await vanityInstance.retrieveVanityForWallet.call(
          gasless
        )).should.equal('nervehammer');
      });

      it('Vanity url should be able to retrive from assigned user wallet address', async function() {
        (await vanityInstance.retrieveWalletForVanity.call(
          'nervehammer'
        )).should.equal(gasless);
      });
    });

    describe('transfer a Vanity url', function() {
      it('should be able to transfer ownership of Vanity url to other user', async function() {
        await vanityInstance.transferOwnershipForVanityURL(anotherUser, {
          from: gasless
        });
      });

      it('should be able to retrive the same Vanity', async function() {
        (await vanityInstance.retrieveVanityForWallet.call(
          anotherUser
        )).should.equal('nervehammer');
      });

      it('should be able to retrive the new wallet address', async function() {
        (await vanityInstance.retrieveWalletForVanity.call(
          'nervehammer'
        )).should.equal(anotherUser);
      });
    });
  });
});
