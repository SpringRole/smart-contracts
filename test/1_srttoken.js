var InviteToken = artifacts.require("./InviteToken.sol");

contract('InviteToken', function(accounts) {
    it("should have decimal place of 18", function() {
        return InviteToken.deployed().then(function(instance) {
            return instance.decimals.call();
        }).then(function(decimals) {
            assert.equal(decimals.valueOf(), 18, "18 decimals not found");
        });
    });

    it("token should have a name", function() {
        return InviteToken.deployed().then(function(instance) {
            return instance.name.call();
        }).then(function(name) {
            assert.isDefined(name.valueOf(), 'token should have a name');
        });
    });

    it("token should have a symbol", function() {
        return InviteToken.deployed().then(function(instance) {
            return instance.symbol.call();
        }).then(function(symbol) {
            assert.isDefined(symbol.valueOf(), 'token should have a symbol');
        });
    });

    it("token should have a maxSupply", function() {
        return InviteToken.deployed().then(function(instance) {
            return instance.maxSupply.call();
        }).then(function(maxSupply) {
            assert.isDefined(maxSupply.valueOf(), 'token should have a maxSupply');
        });
    });

    it("mint should throw error when tried by non owner account", function() {
        return InviteToken.deployed().then(function(instance) {
            return instance.mint.call(10000,{from: accounts[1]});
        }).then(function(minted) {
            assert.isFalse(minted, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("addWhiteListedContracts should throw error when tried by non owner account", function() {
        return InviteToken.deployed().then(function(instance) {
            return instance.addWhiteListedContracts.call(accounts[2],{from: accounts[1]});
        }).then(function(minted) {
            assert.isFalse(minted, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("mint should throw error when tried to mint more than max supply", function() {
        var token;

        return InviteToken.deployed().then(function(instance) {
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

        return InviteToken.deployed().then(function(instance) {
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

        return InviteToken.deployed().then(function(instance) {
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

        return InviteToken.deployed().then(function(instance) {
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

        return InviteToken.deployed().then(function(instance) {
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

        return InviteToken.deployed().then(function(instance) {
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

        return InviteToken.deployed().then(function(instance) {
            token = instance;
            return token.approve(accounts[2],amount,{from:accounts[1]});
        }).then(function() {
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), amount, "Amount wasn't correctly approved");
        });
    });

    it("should increase approval 1 token correctly", function() {
        var token;

        var amount = 1;

        var approval_starting_balance;
        var approval_ending_balance;

        return InviteToken.deployed().then(function(instance) {
            token = instance;
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(balance) {
            approval_starting_balance = balance.toNumber();
            return token.increaseApproval(accounts[2],amount,{from:accounts[1]});
        }).then(function(allowance) {
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(balance) {
            approval_ending_balance = balance.toNumber();
            assert.equal(approval_ending_balance, approval_starting_balance + amount, "Amount wasn't correctly approved");
        });
    });

    it("should decrease approval 1 token correctly", function() {
        var token;

        var amount = 1;

        var approval_starting_balance;
        var approval_ending_balance;

        return InviteToken.deployed().then(function(instance) {
            token = instance;
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(balance) {
            approval_starting_balance = balance.toNumber();
            return token.decreaseApproval(accounts[2],amount,{from:accounts[1]});
        }).then(function(allowance) {
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(balance) {
            approval_ending_balance = balance.toNumber();
            assert.equal(approval_ending_balance, approval_starting_balance - amount, "Amount wasn't correctly approved");
        });
    });

    it("should fail when try to approve 1 token when allowance already exists", function() {
        var token;

        var amount = 1;

        return InviteToken.deployed().then(function(instance) {
            token = instance;
            return token.approve(accounts[2],amount,{from:accounts[1]});
        }).then(function(status) {
            assert.isFalse(status, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });
});
