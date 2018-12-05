var VanityURL = artifacts.require("./VanityURL.sol");
var AirDrop = artifacts.require("./AirDrop.sol");
var SpringToken = artifacts.require("./SPRINGToken.sol");
var Attestation = artifacts.require("./Attestation.sol");

module.exports = function(deployer, network, accounts) {
      deployer.deploy(SpringToken, 1000000)
    .then(function() {
        return deployer.deploy(AirDrop, SpringToken.address);
    }).then(function() {
        return deployer.deploy(VanityURL);
    }).then(function() {
        return deployer.deploy(Attestation);
    });
};
