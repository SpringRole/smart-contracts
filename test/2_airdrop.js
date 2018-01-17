var SRTToken = artifacts.require("./SRTToken.sol");
var AirDrop = artifacts.require("./AirDrop.sol");

contract('Airdrop', function(accounts) {

    var airdropInstance;
    var tokenInstance;

    before(function () {
        return AirDrop.deployed().then(function(instance) {
            airdropInstance = instance;
            return SRTToken.deployed();
        }).then(function(token) {
            tokenInstance = token;
        });
    });

    it("should have token defined", function() {
        return airdropInstance.tokenInstance.call().then(function(instance){
            assert.isDefined(instance, "Token address should be defined");
            assert.equal(instance,tokenInstance.address ,"Token address should be same as SRPMT");
        });
    });

    it("airdrop should fail as no balance is assigned", function() {
        var address = [accounts[1],accounts[2]];
        return airdropInstance.doAirDrop(address,1).then(function(instance){
            assert.isFalse(instance, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("do 1 token airdrop to 2 different address", function() {
        var amount = 1;
        var address = [accounts[1],accounts[2]];

        // Get initial balances of first and second account.
        var account_one = accounts[1];
        var account_two = accounts[2];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        return tokenInstance.mint(10000)
        .then(function(instance){
            // transfer token to airdrop
            return tokenInstance.transfer(airdropInstance.address, 100);
        }).then(function(instance){
            // check balance for account 1
            return tokenInstance.balanceOf.call(account_one);
        }).then(function(balance){
            account_one_starting_balance = balance.toNumber();
            // check balance for account 2
            return tokenInstance.balanceOf.call(account_two);
        }).then(function(balance){
            account_two_starting_balance = balance.toNumber();
            // do airdrop
            return airdropInstance.doAirDrop(address,amount);
        }).then(function(){
            // check balance for account 1
            return tokenInstance.balanceOf.call(account_one);
        }).then(function(balance){
            // check balance for account 2
            account_one_ending_balance = balance.toNumber();
            return tokenInstance.balanceOf.call(account_two);
        }).then(function(balance){
            account_two_ending_balance = balance.toNumber();
            // check if balance has updated or not
            assert.equal(account_one_ending_balance, account_one_starting_balance + amount, "Amount wasn't sent to the receiver one");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver two");
        });
    });
});
