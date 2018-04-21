var InviteToken = artifacts.require("./InviteToken.sol");
var VanityURL = artifacts.require("./VanityURL.sol");
var AirDrop = artifacts.require("./AirDrop.sol");
var SpringToken = artifacts.require("./SPRINGToken.sol");

module.exports = function(deployer,network,accounts) {
    deployer.deploy(InviteToken,1000000).then(function() {
        return deployer.deploy(AirDrop, InviteToken.address);
    }).then(function() {
        return deployer.deploy(VanityURL, InviteToken.address,1,accounts[2]);
    }).then(function() {
        return deployer.deploy(SpringToken,1000000);
    });
};
