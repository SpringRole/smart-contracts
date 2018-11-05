var SpringToken = artifacts.require("./SPRINGToken.sol");

contract('SpringToken', function(accounts) {
    it("should have decimal place of 18", function() {
        return SpringToken.deployed().then(function(instance) {
            return instance.decimals.call();
        }).then(function(decimals) {
            assert.equal(decimals.valueOf(), 18, "18 decimals not found");
        });
    });

    it("token should have a name", function() {
        return SpringToken.deployed().then(function(instance) {
            return instance.name.call();
        }).then(function(name) {
            assert.isDefined(name.valueOf(), 'token should have a name');
        });
    });

    it("token should have a symbol", function() {
        return SpringToken.deployed().then(function(instance) {
            return instance.symbol.call();
        }).then(function(symbol) {
            assert.isDefined(symbol.valueOf(), 'token should have a symbol');
        });
    });

    it("token should have a maxSupply", function() {
        return SpringToken.deployed().then(function(instance) {
            return instance.maxSupply.call();
        }).then(function(maxSupply) {
            assert.isDefined(maxSupply.valueOf(), 'token should have a maxSupply');
        });
    });

    it("token default state should be unpaused", function() {
        return SpringToken.deployed().then(function(instance) {
            return instance.paused.call();
        }).then(function(paused) {
            assert.isFalse(paused.valueOf(), 'token should have a maxSupply');
        });
    });

    it("mint should throw error when tried by non owner account", function() {
        return SpringToken.deployed().then(function(instance) {
            return instance.mint.call(10000,{from: accounts[1]});
        }).then(function(minted) {
            assert.isFalse(minted, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("mint should throw error when tried to mint more than max supply", function() {
        var token;

        return SpringToken.deployed().then(function(instance) {
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

        return SpringToken.deployed().then(function(instance) {
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

        return SpringToken.deployed().then(function(instance) {
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

        return SpringToken.deployed().then(function(instance) {
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

    it("should approve 1 token correctly", function() {
        var token;

        var amount = 1;

        return SpringToken.deployed().then(function(instance) {
            token = instance;
            return token.approve(accounts[2],amount,{from:accounts[1]});
        }).then(function() {
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), amount, "Amount wasn't correctly approved");
        });
    });

    it("should transfer 1 token correctly using 3rd approved address", function() {
        var token;

        var amount = 10;

        var contract_owner = accounts[0];
        var token_owner = accounts[3];
        var spender = accounts[2];
        var transfer_to = accounts[4];

        var allowance_before_transfer;
        var allowance_after_transfer;

        var amount_transferred = 1;

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        return SpringToken.deployed().then(function(instance) {
            token = instance;
            return token.transfer(token_owner, amount, {from: contract_owner});
        }).then(function() {
            return token.balanceOf.call(token_owner);
        }).then(function(balance) {
            account_one_starting_balance = balance.toNumber();
            return token.balanceOf.call(transfer_to);
        }).then(function(balance) {
            account_two_starting_balance = balance.toNumber();
            return token.approve(spender,amount,{from:token_owner});
        }).then(function() {
            return token.allowance.call(token_owner,spender);
        }).then(function(allowance) {
            allowance_before_transfer = allowance.toNumber();
            return token.transferFrom(token_owner,transfer_to,amount_transferred, {from: spender});
        }).then(function() {
            return token.allowance.call(token_owner,spender);
        }).then(function(allowance) {
            allowance_after_transfer = allowance.toNumber();
            assert.equal(allowance_after_transfer, allowance_before_transfer - amount_transferred, "Allowance not updated correctly");
        }).then(function() {
            return token.balanceOf.call(token_owner);
        }).then(function(balance) {
            account_one_ending_balance = balance.toNumber();
            return token.balanceOf.call(transfer_to);
        }).then(function(balance) {
            account_two_ending_balance = balance.toNumber();
            assert.equal(account_one_ending_balance, account_one_starting_balance - amount_transferred, "Amount wasn't correctly taken from the sender");
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount_transferred, "Amount wasn't correctly sent to the receiver");
        });
    });

    it("should increase approval 1 token correctly", function() {
        var token;

        var amount = 1;

        var approval_starting_balance;
        var approval_ending_balance;

        return SpringToken.deployed().then(function(instance) {
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

        return SpringToken.deployed().then(function(instance) {
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

        return SpringToken.deployed().then(function(instance) {
            token = instance;
            return token.approve(accounts[2],amount,{from:accounts[1]});
        }).then(function(status) {
            assert.isFalse(status, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("should be able to change paused status", function() {
        return SpringToken.deployed().then(function(instance) {
            token = instance;
            return token.pause();
        }).then(function() {
            return token.paused.call();
        }).then(function(paused) {
            assert.isTrue(paused.valueOf(), 'should be able to change paused status');
        });
    });

    it("transfer should fail when paused", function() {
        var token;

        // Get initial balances of first and second account.
        var account_one = accounts[0];
        var account_two = accounts[1];

        var account_one_starting_balance;
        var account_two_starting_balance;
        var account_one_ending_balance;
        var account_two_ending_balance;

        var amount = 1;

        return SpringToken.deployed().then(function(instance) {
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

    it("approval should fail when paused", function() {
        var token;

        var amount = 1;

        var approval_starting_balance;
        var approval_ending_balance;

        return SpringToken.deployed().then(function(instance) {
            token = instance;
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(balance) {
            approval_starting_balance = balance.toNumber();
            return token.increaseApproval(accounts[2],amount,{from:accounts[1]});
        }).then(function(result) {
            assert.isFalse(result, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });

    it("decrease approval should fail when paused", function() {
        var token;

        var amount = 1;

        var approval_starting_balance;
        var approval_ending_balance;

        return SpringToken.deployed().then(function(instance) {
            token = instance;
            return token.allowance.call(accounts[1],accounts[2]);
        }).then(function(balance) {
            approval_starting_balance = balance.toNumber();
            return token.decreaseApproval(accounts[2],amount,{from:accounts[1]});
        }).then(function(result) {
            assert.isFalse(result, "transaction should have thrown error");
        }).catch(function(err) {
            assert.isDefined(err, "transaction should have thrown error");
        });
    });
});
