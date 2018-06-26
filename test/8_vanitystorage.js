var VanityStorage = artifacts.require("./VanityStorage.sol");
contract("VanityStorage",function(accounts){
    var vanityInstance;

        it("should be able to reserve a url", function() {
            return VanityStorage.deployed().then(function(instance) {
                return instance.retrieveWalletForVanity.call("vinay_035");
            }).then(function(result){
                assert.equal(result,accounts[1],"Should be able to retrive the same wallet address");
            });
        })
});
