const VanityURL = artifacts.require('./VanityURL.sol');
const AirDrop = artifacts.require('./AirDrop.sol');
const SpringToken = artifacts.require('./SPRINGToken.sol');
const Attestation = artifacts.require('./Attestation.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(SpringToken, 1000000);
    await deployer.deploy(AirDrop, SpringToken.address);
    await deployer.deploy(VanityURL);
    await deployer.deploy(Attestation);
  });
};
