const Attestation = artifacts.require('./Attestation.sol');

const { expectEvent } = require('openzeppelin-test-helpers');

contract('Attestation', function([_, user1, user2]) {
  let attestationInstance;

  before(async function() {
    attestationInstance = await Attestation.deployed();
  });

  it('should be able to write to blockchain', async function() {
    await attestationInstance.write('_type', '_data', { from: user1 });
  });

  it('should be emit Attest event', async function() {
    const { logs } = await attestationInstance.write('some_type', 'some_data', {
      from: user2
    });
    expectEvent.inLogs(logs, 'Attest', {
      _address: user2,
      _type: 'some_type',
      _data: 'some_data'
    });
  });
});
