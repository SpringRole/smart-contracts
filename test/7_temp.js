var temp = artifacts.require("./temp.sol");

contract("temp",function(accounts){
    var vanityInstance;
    
        before(function () {
            return temp.deployed().then(function(instance) {
                vanityInstance = instance;
            });
        });
        it("should fail when tried to reserve non alphanumeric keywords", function() {
            return vanityInstance.reserve('Vi@345').then(function(instance){
                assert.isUndefined(instance,"should fail when tried to reserve non alphanumeric keywords")
            }).catch(function(error){
                assert.isDefined(error,"should fail when tried to reserve non alphanumeric keywords")
            })
        });
    
        it("should fail when tried to reserve less then 4 characters", function() {
            return vanityInstance.reserve('van').then(function(instance){
                assert.isUndefined(instance,"should fail when tried to reserve less then 4 characters")
            }).catch(function(error){
                assert.isDefined(error,"should fail when tried to reserve less then 4 characters")
            })
        });
});