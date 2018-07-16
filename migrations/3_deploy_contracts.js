var VanityURL_Upgrade = artifacts.require("./VanityURL_Upgrade.sol");
var VanityStorage = artifacts.require("./VanityStorage.sol");
var TokenStorage=artifacts.require("./TokenStorage.sol");
var SPRINGToken_Upgrade=artifacts.require("./SPRINGToken_Upgrade.sol");
module.exports = function(deployer) {
    deployer.deploy(VanityURL_Upgrade, VanityStorage.address).
    then(() => {
      VanityStorage.deployed().then(inst => {
        //return inst.allowAccess(VanityURL_Upgrade.address);
      });
    });
    deployer.deploy(SPRINGToken_Upgrade,1000000,TokenStorage.address).
    then(() => {
      VanityStorage.deployed().then(inst => {
        //return inst.allowAccess(VanityURL_Upgrade.address);
      });
    });
 
  };