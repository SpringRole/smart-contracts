var HDWalletProvider = require("truffle-hdwallet-provider-privkey");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 6721975,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
              return new HDWalletProvider(["87BAA9CC66610DA8466516EFC29A6AFC167113EAEAE907637874A4F9AF01868F"],
                    "https://ropsten.infura.io/BbBlRVGSUuAagrvyIjdr")
            },
      network_id: 3,
      gas: 4600000
    }
  }
};
