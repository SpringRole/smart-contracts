var VanityURL_Upgrade = artifacts.require("./VanityURL_Upgrade.sol");
var VanityStorage = artifacts.require("./VanityStorage.sol");
var temp=artifacts.require("./temp.sol");
module.exports = function(deployer) {
    deployer.deploy(VanityURL_Upgrade, VanityStorage.address).
    then(() => {
      VanityStorage.deployed().then(inst => {
        //return inst.allowAccess(VanityURL_Upgrade.address);
      });
    });
        deployer.deploy(temp, VanityStorage.address).
        then(() => {
          VanityStorage.deployed().then(inst => {
            //return inst.allowAccess(VanityURL_Upgrade.address);
          });
        });
  };