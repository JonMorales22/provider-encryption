const Web3 = require('web3');
const crypto = require('crypto');

const INFURA_HTTP = "https://kovan.infura.io/xeb916AFjrcttuQlezyq";
const INFURA_WS = "wss://kovan.infura.io/ws/xeb916AFjrcttuQlezyq";

const AES256 = "aes256";

const { ZapDispatch } = require('@zapjs/dispatch');
const { ZapRegistry } = require('@zapjs/registry');

const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const HDWalletProviderMem = require("truffle-hdwallet-provider");

//INSERT METAMASK WORDS!!!
const web3 = new Web3(new HDWalletProviderMem(, INFURA_HTTP));

const dispatch = new ZapDispatch({ networkId: 42, networkProvider: new Web3.providers.HttpProvider(INFURA_HTTP)} );
const registry = new ZapRegistry({ networkId: 42, networkProvider: new Web3.providers.WebsocketProvider(INFURA_WS)} );

const subPub = '044441a3e9da4f8cdbd85994e79c46f06da180e54cd3fa0a173bd1ded817ef37a5';
const subPubPrepped = '0x4441a3e9da4f8cdbd85994e79c46f06da180e54cd3fa0a173bd1ded817ef37a5'
const subPriv = '215a3ed02876c7e910eabffadf353f73'

const provAddress = "0x3575fFFd17340e075E3b02aDafa69Fb262047acd";
const subAddress = "0x5df6acc490a34f30e20c740d1a3adf23dc4d48a2"


async function encrypt(secret, message) {
	var cipher = crypto.createCipher(AES256, secret);
	
	var eMsg1 = cipher.update(message, 'utf8', 'hex');
	eMsg1 += cipher.final('hex');

	return eMsg1;

}

async function decrypt(secret, cipher) {
	var decipher = crypto.createDecipher(AES256, secret);

	var dMsg1 = decipher.update(cipher, 'hex', 'utf8');
	dMsg1 += decipher.final('utf8')

	return dMsg1;
}

async function main() {
	var message = "ecrypted message!";
	var ecdh = crypto.createECDH("secp128r1");

	ecdh.setPrivateKey(subPriv, 'hex');
	ecdh.setPublicKey(subPub, 'hex');

	var provKey = await registry.getProviderPublicKey(provAddress);
	console.log(web3.utils.toHex(provKey));
	provKey=web3.utils.toHex(provKey);

	var tmp="0x0866c57f065fd2bd4377d32ad0e89cdd97eac3cf8e98965be281e39574b6b700"
	console.log(tmp);

	//var provKey = "040866c57f065fd2bd4377d32ad0e89cdd97eac3cf8e98965be281e39574b6b700";
	// console.log(typeof provKey)

	// provKey = web3.utils.toBN(Number(provKey));
	// console.log(web3.utils.isBigNumber(provKey));

	provKey = '040' + provKey.substring(2);
	console.log(provKey);

	var secret = ecdh.computeSecret(provKey, 'hex');

	var query = await encrypt(secret, message);

	// console.log(web3.utils.utf8ToHex(subPubPrepped));

	var queryTx = await dispatch.queryData({ 
		provider: provAddress,
	 	query: query, 
	 	endpoint: "encrypt",
	 	endpointParams: [subPubPrepped], 
	 	onchainProvider: false, 
	 	onchainSubscriber: false, 
	 	from: subAddress
	 })

	// console.log(queryTx);
	// const _id = queryTx.events['Incoming'].returnValues['id'];
 //    const num = web3.utils.toBN(_id);
 //    const id = '0x' + num.toString(16);

	// var promise = new Promise((resolve, reject) => {
	// 	let fulfilled = false;
 //        dispatch.listenOffchainResponse({ id }, (err, data) => {
 //            // Only call once
 //            if (fulfilled)
 //                return;
 //            fulfilled = true;
 //            // Output response
 //            if (err)
 //                reject(err);
 //            else
 //                resolve(data.returnValues.response);
 //        });
	// })

	// var response = await promise;

	// response = web3.utils.hexToUtf8(response);

	// var result = decrypt(secret, response);

	// console.log("Result: " + result);
}

main();


