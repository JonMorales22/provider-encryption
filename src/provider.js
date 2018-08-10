"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const Web3 = require('web3');
const http = require('http');
const crypto = require('crypto');

/* Sample HTTP data provider */
const CMC_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ZAP&convert=";
/* CoinMarketCap API Key (test use only) */
const CMC_KEY = "&CMC_PRO_API_KEY=1b1593df-f732-4a58-8b84-dbc3bd896741";
/**
 * Handles a query
 * @param writer - HTTP Web3 instance to respond to query with
 * @param queryEvent - Web3 incoming query event
 * @returns ZapProvider instantiated
 */
var provPub = '040866c57f065fd2bd4377d32ad0e89cdd97eac3cf8e98965be281e39574b6b700';
var provPriv = 'ac929c64c13257ae7e26d95bbcd17af2';
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

async function handleQuery(providerW, queryEvent) {
    // helper Web3 instance
    var web3 = new Web3();
    // prep the results of the query
    const query = queryEvent.returnValues.query;
    const endpoint = web3.utils.hexToUtf8(queryEvent.returnValues.endpoint);
    const subscriber = queryEvent.returnValues.subscriber;
    const endpointParams = queryEvent.returnValues.endpointParams;
    const id = queryEvent.returnValues.id;
    // parse the endpoint params
    for (var i = 0; i < endpointParams.length; i++) {
        endpointParams[i] = web3.utils.hexToUtf8(endpointParams[i]);
    }
    var ecdh = crypto.createECDH("secp128r1");

    ecdh.setPrivateKey(provPriv, 'hex');
    ecdh.setPublicKey(provPub, 'hex');

    var secret = ecdh.computeSecret(endpointParams[0], 'hex');

    var dMsg1 = decrypt(secret, query)
    console.log(dMsg1);
    var response = encrypt(secret, "Hello World");
    //console.log(response);
    // we expect a timestamp from query
    providerW.zapDispatch.respond({ queryId: id, responseParams: [response], from: providerW.providerOwner, dynamic: true }).then((txid) => {
        console.log('Response Transaction to', subscriber, "Hash:", txid.transactionHash);
    });
}
exports.handleQuery = handleQuery;
/* Uses the CoinMarketCap API to get the current exchange ratio of ZAP to another base currency */
/* Returns a decimal temperature (Fahrenheit) to the thousandths digit */
async function getPrice(base) {
    const body = await utils_1.requestPromise(CMC_URL + base + CMC_KEY);
    const json = JSON.parse(body);
    const ratio = json.data["ZAP"].quote[base].price;
    return ratio;
}
exports.getPrice = getPrice;
