
var SPRINGToken_Upgrade=artifacts.require("./SPRINGToken_Upgrade.sol");
var TokenVesting=artifacts.require("./TokenVesting.sol");
module.exports = function(deployer) {
    
    //to deploy token vesting contract
    deployer.deploy(TokenVesting,SPRINGToken_Upgrade.address).then(()=>{
       
    });
  };