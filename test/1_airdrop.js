const SPRINGToken = artifacts.require('./SPRINGToken.sol');
const AirDrop = artifacts.require('./AirDrop.sol');

const { BN, ether, balance } = require('openzeppelin-test-helpers');

contract('Airdrop', function([owner, account_one]) {
  let airdropInstance;
  let tokenInstance;
  const ETH_CONTRACT_BALANCE = ether('5');

  before(async function() {
    airdropInstance = await AirDrop.deployed();
    tokenInstance = await SPRINGToken.deployed();
    await airdropInstance.send(ETH_CONTRACT_BALANCE, { from: owner });
  });

  it('should have token defined and equal to SRPMT ', async function() {
    let res = await airdropInstance.tokenInstance.call();
    res.should.be.equal(tokenInstance.address);
  });

  it('should have balance 5 eth', async function() {
    const newbalance = await balance.current(airdropInstance.address);
    newbalance.should.be.bignumber.equal(ETH_CONTRACT_BALANCE);
  });

  it('do 1 token airdrop to 2 different address', async function() {
    const AIRDROP_AMOUNT = ether('1'); // 1 SPRING Tokens
    const ETH_AMOUNT = ether('100'); //100 ETH
    const MINT_TOKEN_AMOUNT = ether('10000'); //10000 SPRING Tokens

    // etherless accounts for testing
    const account_two = await web3.eth.personal.newAccount('zero1');
    const account_three = await web3.eth.personal.newAccount('zero2');

    let account_one_token_starting_balance;
    let account_two_token_starting_balance;
    let account_three_token_starting_balance;

    let account_one_ending_token_balance;
    let account_two_ending_token_balance;
    let account_three_ending_token_balance;

    let account_one_eth_starting_balance = await balance.current(account_one);
    let account_two_eth_starting_balance = await balance.current(account_two);
    let account_three_eth_starting_balance = await balance.current(
      account_three
    );

    let account_one_eth_ending_balance;
    let account_two_eth_ending_balance;
    let account_three_eth_ending_balance;

    let airdropReceivers_batch_1 = [account_one, account_two];

    let airdropReceivers_batch_2 = [account_three];
    await tokenInstance.mint(MINT_TOKEN_AMOUNT, { from: owner });
    // transfer token to airdrop contract

    await tokenInstance.transfer(airdropInstance.address, ETH_AMOUNT, {
      from: owner
    });
    // check balance for account 1
    account_one_token_starting_balance = await tokenInstance.balanceOf.call(
      account_one
    );
    // check balance for account 2
    account_two_token_starting_balance = await tokenInstance.balanceOf.call(
      account_two
    );
    // check balance for account 3
    account_three_token_starting_balance = await tokenInstance.balanceOf.call(
      account_three
    );
    // do airdrop
    await airdropInstance.doAirDrop(
      airdropReceivers_batch_1,
      AIRDROP_AMOUNT,
      ETH_AMOUNT
    );
    // do airdrop batch 2 with high eth amount
    await airdropInstance.doAirDrop(
      airdropReceivers_batch_2,
      AIRDROP_AMOUNT,
      ETH_CONTRACT_BALANCE
    );
    // check balance for account 1
    account_one_ending_token_balance = await tokenInstance.balanceOf.call(
      account_one
    );
    // check balance for account 2
    account_two_ending_token_balance = await tokenInstance.balanceOf.call(
      account_two
    );
    // check balance for account 3
    account_three_ending_token_balance = await tokenInstance.balanceOf.call(
      account_three
    );

    account_one_ending_token_balance.should.be.bignumber.equal(
      account_one_token_starting_balance.add(AIRDROP_AMOUNT)
    );
    account_two_ending_token_balance.should.be.bignumber.equal(
      account_two_token_starting_balance.add(AIRDROP_AMOUNT)
    );
    account_three_ending_token_balance.should.be.bignumber.equal(
      account_three_token_starting_balance.add(AIRDROP_AMOUNT)
    );
    // fetch final eth balance
    account_one_eth_ending_balance = await balance.current(account_one);
    account_two_eth_ending_balance = await balance.current(account_two);
    account_three_eth_ending_balance = await balance.current(account_three);

    // check if eth is updated for 2nd and remains the same for first
    account_one_eth_ending_balance.should.be.bignumber.equal(
      account_one_eth_starting_balance
    );
    account_two_eth_ending_balance.should.be.bignumber.equal(
      account_two_eth_starting_balance
    );
    account_three_eth_ending_balance.should.be.bignumber.equal(
      account_three_eth_starting_balance.add(ETH_CONTRACT_BALANCE)
    );
  });
});
