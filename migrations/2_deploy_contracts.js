const VanityURL = artifacts.require('./VanityURL.sol');
const AirDrop = artifacts.require('./AirDrop.sol');
const SpringToken = artifacts.require('./SPRINGToken.sol');
const Attestation = artifacts.require('./Attestation.sol');
const RelayHub = artifacts.require('./RelayHub.sol');
const RelayRecipient = artifacts.require('./RelayRecipient.sol');
const RLPReader = artifacts.require('./RLPReader.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(SpringToken, 1000000);
    await deployer.deploy(AirDrop, SpringToken.address);
    await deployer.deploy(RLPReader);
    await deployer.link(RLPReader, RelayHub);
    await deployer.deploy(RelayHub);
    await deployer.deploy(VanityURL, RelayHub.address);
    await deployer.deploy(Attestation, RelayHub.address);
    await deployer.link(RelayHub, RelayRecipient);
    await deployer.link(RelayHub, Attestation);
    await deployer.link(RelayHub, VanityURL);
  });
};
