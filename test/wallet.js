var wallet = artifacts.require("./MyWallet.sol");

contract("MyWallet", function(accounts) {

	it('Place 10 ether in wallet', function() {
		var contractInstance;
		return wallet.deployed().then(function(instance) {
			contractInstance = instance;
			return contractInstance.sendTransaction({value: web3.toWei(10, 'ether'), address: contractInstance.address, from: accounts[0]});
		}).then(function(results) {
			assert.equal(web3.eth.getBalance(contractInstance.address).toNumber(), web3.toWei(10, 'ether'), '10 ether not placed in wallet');
		});
	});

	it('Confirm owner can send ether from wallet', function() {
		var walletInstance;
		return wallet.deployed().then(function(instance) {
			walletInstance = instance;
			return walletInstance.spendMoneyOn(accounts[1], web3.toWei(2, 'ether'), "owner send test", {from: accounts[0]});
		}).then(function() {
			assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.toWei(8, 'ether'), 'Wallet balance does not equal 8 ether')
		});
	});

	it('Create proposal and confirm spending money', function() {
		var walletInstance;
		return wallet.deployed().then(function(instance) {
			walletInstance = instance;
			return walletInstance.spendMoneyOn(accounts[2], web3.toWei(5, 'ether'), "because i need money", {from: accounts[2]});
		}).then(function() {
			return walletInstance.confirmProposal(1, {from: accounts[0]});
		}).then(function(results) {
			assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.toWei(3, 'ether'), "Wallet balance does not equal 3 ether");
		});
	});

	it('Confirm proposal already processed', function() {
		var walletInstance;
		return wallet.deployed().then(function(instance) {
			walletInstance = instance;
			return walletInstance.confirmProposal(1, {from: accounts[0]});
		}).then(function() {
			assert.equal(web3.eth.getBalance(walletInstance.address).toNumber(), web3.toWei(3, 'ether'), "Wallet balance does not equal 3 ether")
		});
	});


});