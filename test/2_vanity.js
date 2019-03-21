const VanityURL = artifacts.require('./VanityURL.sol');

const { shouldFail } = require('openzeppelin-test-helpers');

contract('VanityURL', function([owner, user1, user2, user3, user4, user5]) {
  let vanityInstance;

  before(async function() {
    vanityInstance = await VanityURL.deployed();
  });

  describe('reserve a Vanity url', function() {
    before(async function() {
      await vanityInstance.reserve('vinay_035', 'srind1', { from: user1 });
    });

    it('Should be able to retrive the same wallet address', async function() {
      (await vanityInstance.retrieveWalletForVanity.call(
        'vinay_035'
      )).should.equal(user1);
    });

    it('Should be able to retrive the same Vanity', async function() {
      (await vanityInstance.retrieveVanityForWallet.call(user1)).should.equal(
        'vinay_035'
      );
    });

    it('Should be able to retrive the same springrole id', async function() {
      (await vanityInstance.retrieveSpringroleIdForVanity.call(
        'vinay_035'
      )).should.equal('srind1');
    });

    it('Should be able to retrive the same Vanity', async function() {
      (await vanityInstance.retrieveVanityForSpringroleId.call(
        'srind1'
      )).should.equal('vinay_035');
    });
  });

  describe('reserve a Vanity url (case insensitive)', function() {
    before(async function() {
      await vanityInstance.reserve('CASEIN', 'srind2', { from: user2 });
    });

    it('Should be able to retrive the same wallet address', async function() {
      (await vanityInstance.retrieveWalletForVanity.call(
        'casein'
      )).should.equal(user2);
    });

    it('Should be able to retrive the same Vanity', async function() {
      (await vanityInstance.retrieveVanityForWallet.call(user2)).should.equal(
        'casein'
      );
    });

    it('Should be able to retrive the same springrole id', async function() {
      (await vanityInstance.retrieveSpringroleIdForVanity.call(
        'casein'
      )).should.equal('srind2');
    });

    it('Should be able to retrive the same Vanity', async function() {
      (await vanityInstance.retrieveVanityForSpringroleId.call(
        'srind2'
      )).should.equal('casein');
    });
  });

  describe('reserve a non alphanumeric Vanity url', function() {
    it('should fail and revert', async function() {
      await shouldFail.reverting(
        vanityInstance.reserve('Vi@345', 'srind3', { from: user3 })
      );
    });
  });

  describe('reserve a Vanity url of less than 4 characters', function() {
    it('should fail and revert', async function() {
      await shouldFail.reverting(
        vanityInstance.reserve('van', 'srind3', { from: user3 })
      );
    });
  });

  describe('reserve a already reserved Vanity url', function() {
    it('should fail and revert', async function() {
      await shouldFail.reverting(
        vanityInstance.reserve('vinay_035', 'srind3', { from: user3 })
      );
    });
  });

  describe('transfer a Vanity url', function() {
    it('should be able to transfer ownership of Vanity url to other user', async function() {
      await vanityInstance.transferOwnershipForVanityURL(user3, {
        from: user1
      });
    });

    it('should be able to retrive the same Vanity', async function() {
      (await vanityInstance.retrieveVanityForWallet.call(user3)).should.equal(
        'vinay_035'
      );
    });

    it('should be able to retrive the new wallet address', async function() {
      (await vanityInstance.retrieveWalletForVanity.call(
        'vinay_035'
      )).should.equal(user3);
    });
  });

  describe('Not a dApp owner', function() {
    describe('Release Vanity url', function() {
      it('should not be able to release url', async function() {
        await shouldFail.reverting(
          vanityInstance.releaseVanityUrl('casein', { from: user4 })
        );
      });
    });

    describe('Reserve a Vanity url for other user', function() {
      it('should not be able to reserve a url', async function() {
        await shouldFail.reverting(
          vanityInstance.reserveVanityURLByOwner(
            user3,
            'testowner',
            'srind3',
            '0x',
            { from: user4 }
          )
        );
      });
    });
  });

  describe('dApp owner', function() {
    describe('Release Vanity url', function() {
      it('should be able to release url', async function() {
        vanityInstance.releaseVanityUrl('casein', { from: owner });
      });
    });

    describe('Reserve a Vanity url for other user', function() {
      it('should be able to reserve Vanity URL for others', async function() {
        await vanityInstance.reserveVanityURLByOwner(
          user4,
          'testowner',
          'srind3',
          '0x',
          { from: owner }
        );
      });

      it('reserved Vanity url should be assigned to user', async function() {
        (await vanityInstance.retrieveVanityForWallet.call(user4)).should.equal(
          'testowner'
        );
      });

      it('reserved Vanity url should be able to retrive from assigned user wallet address', async function() {
        (await vanityInstance.retrieveWalletForVanity.call(
          'testowner'
        )).should.equal(user4);
      });
    });
  });

  describe('Change Vanity URL', function() {
    describe('address has no Vanity URL', function() {
      it('should fail and revert', async function() {
        await shouldFail.reverting(
          vanityInstance.changeVanityURL('noassigned', 'srind4', {
            from: user5
          })
        );
      });
    });
    describe('when vanity is in use', function() {
      it('should fail and revert', async function() {
        await shouldFail.reverting(
          vanityInstance.changeVanityURL('vinay_035', 'srind4', { from: user3 })
        );
      });
    });

    describe('have an existing Vanity url and new Vanity url not in use', function() {
      it('should be able to change Vanity url', async function() {
        await vanityInstance.changeVanityURL('nervehammer', 'srind4', {
          from: user3
        });
      });

      it('Vanity url should be assigned to user', async function() {
        (await vanityInstance.retrieveVanityForWallet.call(user3)).should.equal(
          'nervehammer'
        );
      });

      it('Vanity url should be able to retrive from assigned user wallet address', async function() {
        (await vanityInstance.retrieveWalletForVanity.call(
          'nervehammer'
        )).should.equal(user3);
      });
    });
  });
});
