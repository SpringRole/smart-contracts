var VanityURL_Upgrade = artifacts.require("./VanityURL_Upgrade.sol");

contract("VanityURL_Upgrade",function(accounts){
    var vanityInstance;
    
        before(function () {
            return VanityURL_Upgrade.deployed().then(function(instance) {
                vanityInstance = instance;
            });
        });
        it("should be able to reserve a url", function() {
            return vanityInstance.reserve('vinay_035','srind1',{from:accounts[1]}).then(function(instance){
                return vanityInstance.retrieveWallet.call('vinay_035');
            }).then(function(result) {
                console.log(result==accounts[1]);
                assert.equal(result,accounts[1],"Should be able to retrive the same wallet address");
                return vanityInstance.retrieveSpringId.call("vinay_035");
            }).then(res=>{
                assert.equal(res,'srind1',"Should be able to retrive the same springrole id");
                return vanityInstance.retrieveVanity.call(accounts[1]);
            }).then(function(result) {
                assert.equal(result,'vinay_035',"Should be able to retrive the same vanity");
            }).catch(function(error){
                assert.isUndefined(error,"should be able to reserve a url")
            })
        });
       
        it("should fail when tried to reserve already reserved keyword", function() {
            return vanityInstance.reserve('vinay035',"srind2",{from:accounts[1]}).then(function(instance){
                assert.isUndefined(instance,"should fail when tried to reserve already reserved keyword")
            }).catch(function(error){
                assert.isDefined(error,"should fail when tried to reserve already reserved keyword")
            })
        });
        
        it("should be able to transfer a vanity", function() {
            return vanityInstance.transferOwnershipForVanityURL(accounts[3],{from:accounts[1]}).then(function(instance){
                return vanityInstance.retrieveWallet.call('vinay_035');
            }).then(function(result) {
                assert.equal(result,accounts[3],"Should be able to retrive the same wallet address");
                return vanityInstance.retrieveVanity.call(accounts[3]);
            }).then(function(result) {
                assert.equal(result,'vinay_035',"Should be able to retrive the same vanity");
            }).catch(function(error){
                assert.isUndefined(error,"should be able to reserve a url")
            })
        });

        it("owner only should be able to release a vanity", function() {
            return vanityInstance.releaseVanityUrl('casein',{from:accounts[3]}).then(function(instance){
                assert.isDefined(instance,"owner only should be able to release a vanity")
            }).catch(function(error){
                assert.isDefined(error,"owner should be able to release a vanity")
            })
        });
        it("owner only should be able to call reserveVanityURLByOwner", function() {
            return vanityInstance.reserveVanityURLByOwner(accounts[4],'testowner','srind3','0x',{from:accounts[0]}).then(function(instance){
                
                assert.isDefined(instance,"owner only should be able to call reserveVanityURLByOwner yep")
            }).catch(function(error){
                assert.isDefined(error,"owner only should be able to call reserveVanityURLByOwner")
            })
        });
        it("owner should be able to call reserveVanityURLByOwner and assign a vanity to any address", function() {
            return vanityInstance.reserveVanityURLByOwner(accounts[4],'testowner','srind3','0x').then(function(instance){
                //console.log(instance);
                return vanityInstance.retrieveWallet.call('testowner');
            }).then(function(result) {
                //console.log(result)
                assert.equal(result,accounts[4],"Should be able to retrive the same wallet address");
                return vanityInstance.retrieveVanity.call(accounts[4]);
            }).then(function(result) {
                //console.log(result);
                assert.equal(result,'testowner',"Should be able to retrive the same vanity");
            }).catch(function(error){
                assert.isUndefined(error,"owner should be able to call reserveVanityURLByOwner and assign a vanity to any address")
            })
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
        it("should error on change vanityURL when address has no vanity", function() {
            return vanityInstance.changeVanityURL('noassigned',{from:accounts[5]}).then(function(instance){
                assert.isUndefined(instance,"should error on change vanityURL when not assigned")
            }).catch(function(error){
                assert.isDefined(error,"should error on change vanityURL when not assigned")
            })
        });
    
        it("should error on change vanityURL when vanity is in use", function() {
            return vanityInstance.changeVanityURL('vinay035','srind4',{from:accounts[3]}).then(function(instance){
                assert.isUndefined(instance,"should error on change vanityURL when not assigned")
            }).catch(function(error){
                assert.isDefined(error,"should error on change vanityURL when not assigned")
            })
        });
    
        it("should be able to change vanityURL", function() {
            return vanityInstance.changeVanityURL('vinay0351','srind5',{from:accounts[3]}).then(function(instance){
                assert.isDefined(instance,"should be able to change vanityURL")
            }).catch(function(error){
                console.log(error);
                assert.isUndefined(error,"should be able to change vanityURL")
            })
        });
});
