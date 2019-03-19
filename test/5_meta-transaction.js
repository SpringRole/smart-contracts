const Attestation = artifacts.require('Attestation');
const RelayHub = artifacts.require('RelayHub');
const RelayProvider = require('./utils/RelayProvider');
const relayHubAddr = '0x9C57C0F1965D225951FE1B2618C92Eefd687654F';

contract('Meta Transaction Test', function() {
  let att;
  let gasless;
  let gasPrice;
  let relay_client_config;

  before(async function() {
    const gasPricePercent = 20;
    gasPrice = ((await web3.eth.getGasPrice()) * (100 + gasPricePercent)) / 100;
    gasless = await web3.eth.personal.newAccount('password');
    web3.eth.personal.unlockAccount(gasless, 'password');
    rhub = await RelayHub.at(relayHubAddr);
    att = await Attestation.deployed();
  });

  it('enable relay', async function() {
    relay_client_config = {
      txfee: 60,
      force_gasPrice: gasPrice, //override requested gas price
      force_gasLimit: 100000, //override requested gas limit.
      verbose: process.env.DEBUG
    };
    let relayProvider = new RelayProvider(
      web3.currentProvider,
      relay_client_config
    );
    Attestation.web3.setProvider(relayProvider);
  });

  it('send gasless tranasaction', async function() {
    console.log('gasless Account = ' + gasless);

    console.log('running gasless');
    let ex;
    try {
      let res = await att.write('_type', '_data', { from: gasless });
    } catch (e) {
      ex = e;
    }
    assert.ok(
      ex == null,
      'should succeed sending gasless transaction through relay. got: ' + ex
    );
  });
});
