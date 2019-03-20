const VanityURL = artifacts.require('./VanityURL.sol');
const AirDrop = artifacts.require('./AirDrop.sol');
const SpringToken = artifacts.require('./SPRINGToken.sol');
const Attestation = artifacts.require('./Attestation.sol');
const RelayHub = artifacts.require('./RelayHub.sol');

const relayHubAddr = '0x9C57C0F1965D225951FE1B2618C92Eefd687654F';

const MAX_SUPPLY =
  '0x130303030303030303030303030303030303030303030303030303030'; // 10000000000 Tokens in HEX

module.exports = function(deployer) {
  deployer.then(async function() {
    await deployer.deploy(SpringToken, MAX_SUPPLY);
    await deployer.deploy(AirDrop, SpringToken.address);
    let relayHub = await RelayHub.at(relayHubAddr);
    await deployer.deploy(VanityURL, relayHub.address);
    await deployer.deploy(Attestation, relayHub.address);
    await relayHub.depositFor(VanityURL.address, { value: 1e18 });
    await relayHub.depositFor(Attestation.address, { value: 1e18 });
  });
};
