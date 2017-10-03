// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

import "bootstrap/dist/css/bootstrap.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import myWallet_artifact from '../../build/contracts/MyWallet.json';

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MyWallet = contract(myWallet_artifact);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MyWallet.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      document.getElementById("accounts").innerHTML = accounts.join("<br />");

      App.basicInfoUpdate();

    });
  },

  basicInfoUpdate: function() {
    MyWallet.deployed().then(function(instance) {
      web3.eth.getBalance(instance.address, function(err, balance) {
        if (err != null) {
          alert("There was an error updating wallet balance");
          return;
        }
        document.getElementById("walletAddress").innerHTML = instance.address;
        document.getElementById("walletEther").innerHTML = web3.fromWei(balance, "ether");
      })
    })
  },

  checkBalance: function() {
    var _account = document.getElementById("to_balance").value;
    MyWallet.deployed().then(function(instance) {
      document.getElementById("accountid").innerHTML = "Account balance";
      document.getElementById("accountbalance").innerHTML = web3.fromWei(web3.eth.getBalance(_account).toNumber(), "ether") + " ether";
    })
  },

  transferEther: function() {
    var _from = document.getElementById("from_transfer").value;
    var _to = document.getElementById("to_transfer").value;
    var _amount = document.getElementById("amount_transfer").value;
    MyWallet.deployed().then(function(instance) {
      return web3.eth.sendTransaction({from: _from, to: _to, value: web3.toWei(_amount, "ether")});
    }).then(function(result) {
      console.log(result);
      document.getElementById("log_title_transfer").innerHTML = "Transfer details";
      document.getElementById("from_details_transfer").innerHTML = _from + "<br /> balance is now " + web3.fromWei(web3.eth.getBalance(_from).toNumber(), "ether") + "<br /><br />";
      document.getElementById("to_details_transfer").innerHTML = _to + "<br /> balance is now " + web3.fromWei(web3.eth.getBalance(_to).toNumber(), "ether") + "<br /><br />";
      App.basicInfoUpdate();
    })
  },

  submitEtherToWallet: function() {
    MyWallet.deployed().then(function(instance) {
      return instance.sendTransaction({from: account, to: instance.address, value: web3.toWei(5, "ether")});
    }).then(function(result) {
      App.basicInfoUpdate();
    })
  },

  submitProposal: function() {
    var _from = document.getElementById("creator_proposal").value;
    var _to = document.getElementById("to_proposal").value;
    var _amount = document.getElementById("amount").value;
    var _msg = document.getElementById("reason").value;
    MyWallet.deployed().then(function(instance) {
      return instance.spendMoneyOn(_to, web3.toWei(_amount, "ether"), _msg, {from: _from, gas: 500000});
    }).then(function(result) {
      console.log(result);
      var fullMessage = "";
     
      for (var i = 0; i < result.logs.length; i++) {
        fullMessage += JSON.stringify(result.logs[i]) + "<br />";
      }
      document.getElementById("log-title").innerHTML = "Transaction details";
      document.getElementById("message").innerHTML = fullMessage;
      App.basicInfoUpdate();
    })
  },

  sendCoin: function() {
    var self = this;
  }

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
