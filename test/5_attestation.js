var Attestation = artifacts.require("./Attestation.sol");

contract('Attestation', function(accounts) {

    var attestationInstance;

    before(function () {
        return Attestation.deployed().then(function(instance) {
            attestationInstance = instance;
        });
    });

    it("should write to blockchain", function() {
        return attestationInstance.write('_type','_data').then(function(instance){
            assert.isDefined(instance,"should be able to write to blockchain")
        }).catch(function(error){
            assert.isUndefined(error,"should be able to write to blockchain")
        })
    });
});
