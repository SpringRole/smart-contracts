const SpringToken = artifacts.require('./SPRINGToken.sol');
const {
  BN,
  ether,
  constants,
  expectEvent,
  shouldFail
} = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

contract('SpringToken', function([owner, notOwner, recipient, anotherAccount]) {
  const MAX_SUPPLY = ether('10000000000');
  const MINT_TOKENS = ether('1000');

  let tokenInstance;
  beforeEach(async function() {
    tokenInstance = await SpringToken.new(MAX_SUPPLY);
    await tokenInstance.mint(MINT_TOKENS, { from: owner });
  });

  describe('Token Details', function() {
    const _name = 'SPRING Token';
    const _symbol = 'SPRING';
    const _decimals = new BN(18);

    it('has a name', async function() {
      (await tokenInstance.name()).should.be.equal(_name);
    });

    it('has a symbol', async function() {
      (await tokenInstance.symbol()).should.be.equal(_symbol);
    });

    it('has an amount of decimal', async function() {
      (await tokenInstance.decimals()).should.be.bignumber.equal(_decimals);
    });

    it('token should have a maxSupply', async function() {
      (await tokenInstance.maxSupply()).should.be.bignumber.equal(MAX_SUPPLY);
    });
  });

  describe('Mint Tokens', function() {
    describe('Not dApp Owner', function() {
      it('mint should fail and reverts', async function() {
        await shouldFail.reverting(
          tokenInstance.mint(MINT_TOKENS, { from: notOwner })
        );
      });
    });

    describe('dApp Owner', function() {
      describe('mint more than Max Supply', function() {
        it('mint should fail and reverts', async function() {
          await shouldFail.reverting(
            tokenInstance.mint(MAX_SUPPLY.addn(1), { from: owner })
          );
        });
      });

      describe('mint less than Max Supply', function() {
        it('mints the requested amount', async function() {
          await tokenInstance.mint(MINT_TOKENS, { from: owner });
        });

        it('emits a transfer event', async function() {
          const { logs } = await tokenInstance.mint(MINT_TOKENS, {
            from: owner
          });
          expectEvent.inLogs(logs, 'Transfer', {
            from: ZERO_ADDRESS,
            to: owner,
            value: MINT_TOKENS
          });
        });
      });
    });
  });

  describe('total supply', function() {
    it('returns the total amount of tokens', async function() {
      (await tokenInstance.totalSupply()).should.be.bignumber.equal(
        MINT_TOKENS
      );
    });
  });

  describe('balanceOf', function() {
    describe('when the requested account has no tokens', function() {
      it('returns zero', async function() {
        (await tokenInstance.balanceOf(notOwner)).should.be.bignumber.equal(
          '0'
        );
      });
    });

    describe('when the requested account has some tokens', function() {
      it('returns the total amount of tokens', async function() {
        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(
          MINT_TOKENS
        );
      });
    });
  });

  describe('transfer', function() {
    const to = recipient;

    describe('when the sender does not have enough balance', function() {
      const amount = MINT_TOKENS.addn(1);

      it('reverts', async function() {
        await shouldFail.reverting(
          tokenInstance.transfer(to, amount, { from: owner })
        );
      });
    });

    describe('when the sender has enough balance', function() {
      const amount = MINT_TOKENS;

      it('transfers the requested amount', async function() {
        await tokenInstance.transfer(to, amount, { from: owner });

        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal('0');

        (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(amount);
      });

      it('emits a transfer event', async function() {
        const { logs } = await tokenInstance.transfer(to, amount, {
          from: owner
        });

        expectEvent.inLogs(logs, 'Transfer', {
          from: owner,
          to: to,
          value: amount
        });
      });
    });
  });

  describe('transfer from', function() {
    const spender = recipient;
    const to = anotherAccount;

    describe('when the spender has enough approved balance', function() {
      beforeEach(async function() {
        await tokenInstance.approve(spender, MINT_TOKENS, {
          from: owner
        });
      });

      describe('when the initial holder has enough balance', function() {
        const amount = MINT_TOKENS;

        it('transfers the requested amount', async function() {
          await tokenInstance.transferFrom(owner, to, amount, {
            from: spender
          });

          (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal('0');

          (await tokenInstance.balanceOf(to)).should.be.bignumber.equal(amount);
        });

        it('decreases the spender allowance', async function() {
          await tokenInstance.transferFrom(owner, to, amount, {
            from: spender
          });

          (await tokenInstance.allowance(
            owner,
            spender
          )).should.be.bignumber.equal('0');
        });

        it('emits a transfer event', async function() {
          const { logs } = await tokenInstance.transferFrom(owner, to, amount, {
            from: spender
          });

          await expectEvent.inLogs(logs, 'Transfer', {
            from: owner,
            to: to,
            value: amount
          });
        });
      });

      describe('when the initial holder does not have enough balance', function() {
        const amount = MINT_TOKENS.addn(1);

        it('reverts', async function() {
          await shouldFail.reverting(
            tokenInstance.transferFrom(owner, to, amount, {
              from: spender
            })
          );
        });
      });
    });

    describe('when the spender does not have enough approved balance', function() {
      beforeEach(async function() {
        await tokenInstance.approve(spender, MINT_TOKENS.subn(1), {
          from: owner
        });
      });

      describe('when the initial holder has enough balance', function() {
        const amount = MINT_TOKENS;

        it('reverts', async function() {
          await shouldFail.reverting(
            tokenInstance.transferFrom(owner, to, amount, {
              from: spender
            })
          );
        });
      });

      describe('when the initial holder does not have enough balance', function() {
        const amount = MINT_TOKENS.addn(1);

        it('reverts', async function() {
          await shouldFail.reverting(
            tokenInstance.transferFrom(owner, to, amount, {
              from: spender
            })
          );
        });
      });
    });
  });

  describe('decrease approval', function() {
    const spender = recipient;

    function shouldDecreaseApproval(amount) {
      describe('when the spender had an approved amount', function() {
        const approvedAmount = amount;

        beforeEach(async function() {
          ({ logs: this.logs } = await tokenInstance.approve(
            spender,
            approvedAmount,
            { from: owner }
          ));
        });

        it('emits an approval event', async function() {
          const { logs } = await tokenInstance.decreaseApproval(
            spender,
            approvedAmount,
            { from: owner }
          );

          expectEvent.inLogs(logs, 'Approval', {
            owner: owner,
            spender: spender,
            value: new BN(0)
          });
        });

        it('decreases the spender allowance subtracting the requested amount', async function() {
          await tokenInstance.decreaseApproval(
            spender,
            approvedAmount.subn(1),
            { from: owner }
          );

          (await tokenInstance.allowance(
            owner,
            spender
          )).should.be.bignumber.equal('1');
        });

        it('sets the allowance to zero when all allowance is removed', async function() {
          await tokenInstance.decreaseApproval(spender, approvedAmount, {
            from: owner
          });
          (await tokenInstance.allowance(
            owner,
            spender
          )).should.be.bignumber.equal('0');
        });
      });
    }

    describe('when the sender has enough balance', function() {
      const amount = MINT_TOKENS;

      shouldDecreaseApproval(amount);
    });

    describe('when the sender does not have enough balance', function() {
      const amount = MINT_TOKENS.addn(1);

      shouldDecreaseApproval(amount);
    });
  });

  describe('increase approval', function() {
    const amount = MINT_TOKENS;

    const spender = recipient;

    describe('when the sender has enough balance', function() {
      it('emits an approval event', async function() {
        const { logs } = await tokenInstance.increaseApproval(spender, amount, {
          from: owner
        });

        expectEvent.inLogs(logs, 'Approval', {
          owner: owner,
          spender: spender,
          value: amount
        });
      });

      describe('when there was no approved amount before', function() {
        it('approves the requested amount', async function() {
          await tokenInstance.increaseApproval(spender, amount, {
            from: owner
          });

          (await tokenInstance.allowance(
            owner,
            spender
          )).should.be.bignumber.equal(amount);
        });
      });

      describe('when the spender had an approved amount', function() {
        beforeEach(async function() {
          await tokenInstance.approve(spender, new BN(1), { from: owner });
        });

        it('increases the spender allowance adding the requested amount', async function() {
          await tokenInstance.increaseApproval(spender, amount, {
            from: owner
          });

          (await tokenInstance.allowance(
            owner,
            spender
          )).should.be.bignumber.equal(amount.addn(1));
        });
      });
    });

    describe('when the sender does not have enough balance', function() {
      const amount = MINT_TOKENS.addn(1);

      it('emits an approval event', async function() {
        const { logs } = await tokenInstance.increaseApproval(spender, amount, {
          from: owner
        });

        expectEvent.inLogs(logs, 'Approval', {
          owner: owner,
          spender: spender,
          value: amount
        });
      });

      describe('when there was no approved amount before', function() {
        it('approves the requested amount', async function() {
          await tokenInstance.increaseApproval(spender, amount, {
            from: owner
          });

          (await tokenInstance.allowance(
            owner,
            spender
          )).should.be.bignumber.equal(amount);
        });
      });

      describe('when the spender had an approved amount', function() {
        beforeEach(async function() {
          await tokenInstance.approve(spender, new BN(1), { from: owner });
        });

        it('increases the spender allowance adding the requested amount', async function() {
          await tokenInstance.increaseApproval(spender, amount, {
            from: owner
          });

          (await tokenInstance.allowance(
            owner,
            spender
          )).should.be.bignumber.equal(amount.addn(1));
        });
      });
    });
  });

  describe('pause', function() {
    describe('when the sender is the token pauser', function() {
      const from = owner;

      describe('when the token is unpaused', function() {
        it('pauses the token', async function() {
          await tokenInstance.pause({ from });
          (await tokenInstance.paused()).should.equal(true);
        });

        it('emits a Pause event', async function() {
          const { logs } = await tokenInstance.pause({ from });

          expectEvent.inLogs(logs, 'Pause');
        });
      });

      describe('when the token is paused', function() {
        beforeEach(async function() {
          await tokenInstance.pause({ from });
        });

        it('reverts', async function() {
          await shouldFail.reverting(tokenInstance.pause({ from }));
        });
      });
    });

    describe('when the sender is not the token pauser', function() {
      const from = anotherAccount;

      it('reverts', async function() {
        await shouldFail.reverting(tokenInstance.pause({ from }));
      });
    });
  });

  describe('unpause', function() {
    describe('when the sender is the token pauser', function() {
      const from = owner;

      describe('when the token is paused', function() {
        beforeEach(async function() {
          await tokenInstance.pause({ from });
        });

        it('unpauses the token', async function() {
          await tokenInstance.unpause({ from });
          (await tokenInstance.paused()).should.equal(false);
        });

        it('emits an Unpause event', async function() {
          const { logs } = await tokenInstance.unpause({ from });

          expectEvent.inLogs(logs, 'Unpause');
        });
      });

      describe('when the token is unpaused', function() {
        it('reverts', async function() {
          await shouldFail.reverting(tokenInstance.unpause({ from }));
        });
      });
    });

    describe('when the sender is not the token pauser', function() {
      const from = anotherAccount;

      it('reverts', async function() {
        await shouldFail.reverting(tokenInstance.unpause({ from }));
      });
    });
  });

  describe('in Paused state', function() {
    const from = owner;

    describe('paused', function() {
      it('is not paused by default', async function() {
        (await tokenInstance.paused({ from })).should.equal(false);
      });

      it('is paused after being paused', async function() {
        await tokenInstance.pause({ from });
        (await tokenInstance.paused({ from })).should.equal(true);
      });

      it('is not paused after being paused and then unpaused', async function() {
        await tokenInstance.pause({ from });
        await tokenInstance.unpause({ from });
        (await tokenInstance.paused()).should.equal(false);
      });
    });

    describe('transfer', function() {
      it('allows to transfer when unpaused', async function() {
        await tokenInstance.transfer(recipient, MINT_TOKENS, { from: owner });

        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal('0');
        (await tokenInstance.balanceOf(recipient)).should.be.bignumber.equal(
          MINT_TOKENS
        );
      });

      it('allows to transfer when paused and then unpaused', async function() {
        await tokenInstance.pause({ from: owner });
        await tokenInstance.unpause({ from: owner });

        await tokenInstance.transfer(recipient, MINT_TOKENS, { from: owner });

        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal('0');
        (await tokenInstance.balanceOf(recipient)).should.be.bignumber.equal(
          MINT_TOKENS
        );
      });

      it('reverts when trying to transfer when paused', async function() {
        await tokenInstance.pause({ from: owner });

        await shouldFail.reverting(
          tokenInstance.transfer(recipient, MINT_TOKENS, { from: owner })
        );
      });
    });

    describe('approve', function() {
      const allowance = new BN(40);

      it('allows to approve when unpaused', async function() {
        await tokenInstance.approve(anotherAccount, allowance, {
          from: owner
        });

        (await tokenInstance.allowance(
          owner,
          anotherAccount
        )).should.be.bignumber.equal(allowance);
      });

      it('allows to approve when paused and then unpaused', async function() {
        await tokenInstance.pause({ from: owner });
        await tokenInstance.unpause({ from: owner });

        await tokenInstance.approve(anotherAccount, allowance, {
          from: owner
        });

        (await tokenInstance.allowance(
          owner,
          anotherAccount
        )).should.be.bignumber.equal(allowance);
      });

      it('reverts when trying to approve when paused', async function() {
        await tokenInstance.pause({ from: owner });

        await shouldFail.reverting(
          tokenInstance.approve(anotherAccount, allowance, { from: owner })
        );
      });
    });

    describe('transfer from', function() {
      const allowance = new BN(40);

      beforeEach(async function() {
        await tokenInstance.approve(anotherAccount, allowance, {
          from: owner
        });
      });

      it('allows to transfer from when unpaused', async function() {
        await tokenInstance.transferFrom(owner, recipient, allowance, {
          from: anotherAccount
        });

        (await tokenInstance.balanceOf(recipient)).should.be.bignumber.equal(
          allowance
        );
        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(
          MINT_TOKENS.sub(allowance)
        );
      });

      it('allows to transfer when paused and then unpaused', async function() {
        await tokenInstance.pause({ from: owner });
        await tokenInstance.unpause({ from: owner });

        await tokenInstance.transferFrom(owner, recipient, allowance, {
          from: anotherAccount
        });

        (await tokenInstance.balanceOf(recipient)).should.be.bignumber.equal(
          allowance
        );
        (await tokenInstance.balanceOf(owner)).should.be.bignumber.equal(
          MINT_TOKENS.sub(allowance)
        );
      });

      it('reverts when trying to transfer from when paused', async function() {
        await tokenInstance.pause({ from: owner });

        await shouldFail.reverting(
          tokenInstance.transferFrom(owner, recipient, allowance, {
            from: anotherAccount
          })
        );
      });
    });

    describe('decrease approval', function() {
      const allowance = new BN(40);
      const decrement = new BN(10);

      beforeEach(async function() {
        await tokenInstance.approve(anotherAccount, allowance, {
          from: owner
        });
      });

      it('allows to decrease approval when unpaused', async function() {
        await tokenInstance.decreaseApproval(anotherAccount, decrement, {
          from: owner
        });

        (await tokenInstance.allowance(
          owner,
          anotherAccount
        )).should.be.bignumber.equal(allowance.sub(decrement));
      });

      it('allows to decrease approval when paused and then unpaused', async function() {
        await tokenInstance.pause({ from: owner });
        await tokenInstance.unpause({ from: owner });

        await tokenInstance.decreaseApproval(anotherAccount, decrement, {
          from: owner
        });

        (await tokenInstance.allowance(
          owner,
          anotherAccount
        )).should.be.bignumber.equal(allowance.sub(decrement));
      });

      it('reverts when trying to transfer when paused', async function() {
        await tokenInstance.pause({ from: owner });

        await shouldFail.reverting(
          tokenInstance.decreaseApproval(anotherAccount, decrement, {
            from: owner
          })
        );
      });
    });

    describe('increase approval', function() {
      const allowance = new BN(40);
      const increment = new BN(30);

      beforeEach(async function() {
        await tokenInstance.approve(anotherAccount, allowance, {
          from: owner
        });
      });

      it('allows to increase approval when unpaused', async function() {
        await tokenInstance.increaseApproval(anotherAccount, increment, {
          from: owner
        });

        (await tokenInstance.allowance(
          owner,
          anotherAccount
        )).should.be.bignumber.equal(allowance.add(increment));
      });

      it('allows to increase approval when paused and then unpaused', async function() {
        await tokenInstance.pause({ from: owner });
        await tokenInstance.unpause({ from: owner });

        await tokenInstance.increaseApproval(anotherAccount, increment, {
          from: owner
        });

        (await tokenInstance.allowance(
          owner,
          anotherAccount
        )).should.be.bignumber.equal(allowance.add(increment));
      });

      it('reverts when trying to increase approval when paused', async function() {
        await tokenInstance.pause({ from: owner });

        await shouldFail.reverting(
          tokenInstance.increaseApproval(anotherAccount, increment, {
            from: owner
          })
        );
      });
    });
  });
});
