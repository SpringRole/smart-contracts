var InviteToken = artifacts.require("./InviteToken.sol");
var VanityURL = artifacts.require("./VanityURL.sol");
var AirDrop = artifacts.require("./AirDrop.sol");
var SpringToken = artifacts.require("./SPRINGToken.sol");
var Attestation = artifacts.require("./Attestation_stateless.sol");
var VanityStorage = artifacts.require("./VanityStorage.sol");
var TokenStorage=artifacts.require("./TokenStorage.sol");
var AttestStorage=artifacts.require("./AttestStorage.sol");
var SkillStorage=artifacts.require("./SkillStorage.sol");
module.exports = function(deployer,network,accounts) {
    deployer.deploy(InviteToken,1000000).then(function() {
        return deployer.deploy(AirDrop, InviteToken.address);
    }).then(function() {
        return deployer.deploy(VanityURL);
    }).then(function() {
        return deployer.deploy(Attestation);
    }).then(function() {
        return deployer.deploy(SpringToken,1000000);
    }).then(function(){
        return deployer.deploy(VanityStorage);
    }).then(function(){
        return deployer.deploy(TokenStorage);
    }).then(function(){
        return deployer.deploy(AttestStorage);
    }).then(function(){
        return deployer.deploy(SkillStorage);
    });
};
