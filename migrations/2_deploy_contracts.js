var VanityURL = artifacts.require("./VanityURL.sol");
var AirDrop = artifacts.require("./AirDrop.sol");
var SpringToken = artifacts.require("./SPRINGToken.sol");
var Attestation = artifacts.require("./Attestation.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(SpringToken, 1000000)
    .then(function() {
        return deployer.deploy(AirDrop, 0x1d08d05638a2a006707cec99dba40aae3b9d54fc);
    }).then(function() {
        return deployer.deploy(VanityURL);
    }).then(function() {
        return deployer.deploy(Attestation);
    });
};
