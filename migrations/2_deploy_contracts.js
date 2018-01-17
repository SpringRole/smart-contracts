var SRTToken = artifacts.require("./SRTToken.sol");
var VanityURL = artifacts.require("./VanityURL.sol");
var AirDrop = artifacts.require("./AirDrop.sol");

module.exports = function(deployer,network,accounts) {
    deployer.deploy(SRTToken,1000000).then(function() {
        return deployer.deploy(AirDrop, SRTToken.address);
    }).then(function() {
        return deployer.deploy(VanityURL, SRTToken.address,1,accounts[2]);
    });
};
