var SRTToken = artifacts.require("./SRTToken.sol");

contract('SRTToken', function(accounts) {
    it("should have decimal place of 18", function() {
        return SRTToken.deployed().then(function(instance) {
            return instance.decimals.call();
        }).then(function(decimals) {
            assert.equal(decimals.valueOf(), 18, "18 decimals not found");
        });
    });

    it("token should have a name", function() {
        return SRTToken.deployed().then(function(instance) {
            return instance.name.call();
        }).then(function(name) {
            assert.isDefined(name.valueOf(), 'token should have a name');
        });
    });

    it("token should have a symbol", function() {
        return SRTToken.deployed().then(function(instance) {
            return instance.symbol.call();
        }).then(function(symbol) {
            assert.isDefined(symbol.valueOf(), 'token should have a symbol');
        });
    });

    it("token should have a maxSupply", function() {
        return SRTToken.deployed().then(function(instance) {
            return instance.maxSupply.call();
        }).then(function(maxSupply) {
            assert.isDefined(maxSupply.valueOf(), 'token should have a maxSupply');
        });
    });

    it("mint should throw error when tried by non owner account", function() {
        return SRTToken.deployed().then(function(instance) {
            return instance.mint.call(10000,{from: accounts[1]});
        }).then(function(minted) {
            assert.isFalse(minted, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("addWhiteListedContracts should throw error when tried by non owner account", function() {
        return SRTToken.deployed().then(function(instance) {
            return instance.addWhiteListedContracts.call(accounts[2],{from: accounts[1]});
        }).then(function(minted) {
            assert.isFalse(minted, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("mint should throw error when tried to mint more than max supply", function() {
        var token;

        return SRTToken.deployed().then(function(instance) {
            token = instance;
            return token.maxSupply.call();
        }).then(function(maxSupply) {
            return instance.mint(maxSupply.toNumber()+1);
        }).then(function(minted) {
            assert.isFalse(minted, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("should mint 10000 when tried by owner account", function() {
        var token;
        var amount = 10000;
        var old_balance;
        var new_balance;

        return SRTToken.deployed().then(function(instance) {
            token = instance;
            return token.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            old_balance = balance.toNumber();
            return token.mint(amount);
        }).then(function(minted) {
            return token.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            new_balance = balance.toNumber();
            assert.equal(new_balance, old_balance+amount, "10000 tokens were not minted or not assigned to owner");
        });
    });

    it("should transfer 10 token correctly", function() {
        var token;

        // Get initial balances of first and second account.
        var account_one = accounts[0];
        var account_two = accounts[1];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 10;

        return SRTToken.deployed().then(function(instance) {
            token = instance;
            return token.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_starting_balance = balance.toNumber();
            return token.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_starting_balance = balance.toNumber();
            return token.transfer(account_two, amount, {from: account_one});
        }).then(function() {
            return token.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_ending_balance = balance.toNumber();
            return token.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_ending_balance = balance.toNumber();
            assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
        });
    });

    it("should transfer should fail when low balance", function() {
        var token;

        // Get initial balances of first and second account.
        var account_one = accounts[2];
        var account_two = accounts[3];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 10;

        return SRTToken.deployed().then(function(instance) {
            token = instance;
            return token.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_starting_balance = balance.toNumber();
            return token.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_starting_balance = balance.toNumber();
            return token.transfer(account_two, amount, {from: account_one});
        }).then(function(result) {
            assert.isFalse(result, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("should fail while running do transfer when done via third address when not whitelisted", function() {
        var token;

        // Get initial balances of first and second account.
        var account_one = accounts[0];
        var account_two = accounts[1];
        var account_three = accounts[2];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 10;

        return SRTToken.deployed().then(function(instance) {
            token = instance;
            return token.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_starting_balance = balance.toNumber();
            return token.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_starting_balance = balance.toNumber();
            return token.doTransfer(account_one,account_two, amount, {from: account_three});
        }).then(function(result) {
            assert.isFalse(result, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("should transfer 10 token correctly when done via third whitelisted address", function() {
        var token;

        // Get initial balances of first and second account.
        var account_one = accounts[0];
        var account_two = accounts[1];
        var account_three = accounts[2];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 10;

        return SRTToken.deployed().then(function(instance) {
            token = instance;
            return token.addWhiteListedContracts(account_three);
        }).then(function() {
            return token.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_starting_balance = balance.toNumber();
            return token.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_starting_balance = balance.toNumber();
            return token.doTransfer(account_one,account_two, amount, {from: account_three});
        }).then(function() {
            return token.balanceOf.call(account_one);
        }).then(function(balance) {
            account_one_ending_balance = balance.toNumber();
            return token.balanceOf.call(account_two);
        }).then(function(balance) {
            account_two_ending_balance = balance.toNumber();
            assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
        });
    });

    it("should approve 1 token correctly", function() {
        var token;

        var amount = 1;

        return SRTToken.deployed().then(function(instance) {
            token = instance;
            return token.approve(accounts[2],amount,{from:accounts[1]});
        }).then(function() {
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), amount, "Amount wasn't correctly approved");
        });
    });
});
