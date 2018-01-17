var SRTToken = artifacts.require("./SRTToken.sol");
var VanityURL = artifacts.require("./VanityURL.sol");

contract('VanityURL', function(accounts) {
    var vanityInstance;
    var tokenInstance;

    before(function () {
        return VanityURL.deployed().then(function(instance) {
            vanityInstance = instance;
            return SRTToken.deployed();
        }).then(function(token) {
            tokenInstance = token;
            // mint 1000 tokens
            return tokenInstance.mint(1000);
        }).then(function(minted) {
            return tokenInstance.transfer(accounts[1],10);
        }).then(function(transfer) {
            // add vanity contract to whitelist
            return tokenInstance.addWhiteListedContracts(vanityInstance.address);
        }).then(function(result) {
            assert.isDefined(result,"Vanity Contract should get added to whitelisted contracts")
        }).catch(function(error){
            assert.isUndefined(error,"Vanity Contract should get added to whitelisted contracts")
        })
    });

    it("should have token defined", function() {
        return vanityInstance.tokenAddress.call().then(function(instance){
            assert.isDefined(instance, "Token address should be defined");
            assert.equal(instance,tokenInstance.address ,"Token address should be same as SRPMT");
        });
    });

    it("should have reservePricing defined", function() {
        return vanityInstance.reservePricing.call().then(function(instance){
            assert.isDefined(instance, "Token reservePricing should be defined");
        });
    });

    it("should be able to reserve a url", function() {

        var amount = 1; //reserve fees
        // Get initial balances of first and second account.
        var account_one = accounts[1];
        var account_two = accounts[2];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        tokenInstance.balanceOf.call(account_one).then(function(balance){
            account_one_starting_balance = balance.toNumber();
            // check balance for account 2
            return tokenInstance.balanceOf.call(account_two);
        }).then(function(balance){
            account_two_starting_balance = balance.toNumber();
            return vanityInstance.reserve('vinay035',{from:accounts[1]});
        }).then(function(instance){
            return vanityInstance.retrieveWalletForVanity.call('vinay035');
        }).then(function(result) {
            assert.equal(result,accounts[1],"Should be able to retrive the same wallet address");
            return vanityInstance.retrieveVanityForWallet.call(accounts[1]);
        }).then(function(result) {
            assert.equal(result,'vinay035',"Should be able to retrive the same vanity");
        }).then(function() {
            return tokenInstance.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_ending_balance = balance.toNumber();
            return tokenInstance.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_ending_balance = balance.toNumber();
            assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to tokenAddress");
        }).catch(function(error){
            assert.isUndefined(error,"should be able to reserve a url")
        })
    });

    it("reserve url should be case insensitive", function() {
        return vanityInstance.reserve('CASEIN').then(function(instance){
            return vanityInstance.retrieveWalletForVanity.call('casein');
        }).then(function(result) {
            assert.equal(result,accounts[0],"Should be able to retrive the same wallet address");
            return vanityInstance.retrieveVanityForWallet.call(accounts[0]);
        }).then(function(result) {
            assert.equal(result,'casein',"reserve url should be case insensitive");
        }).catch(function(error){
            assert.isUndefined(error,"should be able to reserve a url")
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

    it("should fail when tried to reserve already reserved keyword", function() {
        return vanityInstance.reserve('vinay035').then(function(instance){
            assert.isUndefined(instance,"should fail when tried to reserve lready reserved keyword")
        }).catch(function(error){
            assert.isDefined(error,"should fail when tried to reserve already reserved keyword")
        })
    });

    it("should be able to transfer a vanity", function() {
        return vanityInstance.transferOwnershipForVanityURL(accounts[3],{from:accounts[1]}).then(function(instance){
            return vanityInstance.retrieveWalletForVanity.call('vinay035');
        }).then(function(result) {
            assert.equal(result,accounts[3],"Should be able to retrive the same wallet address");
            return vanityInstance.retrieveVanityForWallet.call(accounts[3]);
        }).then(function(result) {
            assert.equal(result,'vinay035',"Should be able to retrive the same vanity");
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

    it("owner should be able to release a vanity", function() {
        return vanityInstance.releaseVanityUrl('casein').then(function(instance){
            return vanityInstance.retrieveWalletForVanity.call('casein');
        }).then(function(result){
            assert.equal(result,'0x0000000000000000000000000000000000000000',"owner should be able to release a vanity")
        }).catch(function(error){
            assert.isUndefined(error,"owner should be able to release a vanity")
        })
    });

    it("owner only should be able to call reserveVanityURLByOwner", function() {
        return vanityInstance.reserveVanityURLByOwner(accounts[4],'testowner',{from:accounts[3]}).then(function(instance){
            assert.isDefined(instance,"owner only should be able to call reserveVanityURLByOwner")
        }).catch(function(error){
            assert.isDefined(error,"owner only should be able to call reserveVanityURLByOwner")
        })
    });

    it("owner should be able to call reserveVanityURLByOwner and assign a vanity to any address", function() {
        return vanityInstance.reserveVanityURLByOwner(accounts[4],'testowner').then(function(instance){
            return vanityInstance.retrieveWalletForVanity.call('testowner');
        }).then(function(result) {
            assert.equal(result,accounts[4],"Should be able to retrive the same wallet address");
            return vanityInstance.retrieveVanityForWallet.call(accounts[4]);
        }).then(function(result) {
            assert.equal(result,'testowner',"Should be able to retrive the same vanity");
        }).catch(function(error){
            assert.isUndefined(error,"owner should be able to call reserveVanityURLByOwner and assign a vanity to any address")
        })
    });
});
