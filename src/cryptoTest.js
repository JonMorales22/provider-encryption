var crypto = require('crypto');
const AES256 = "aes256";

//ECDH private and public keys computed beforehand in node terminal
var provPub = '040866c57f065fd2bd4377d32ad0e89cdd97eac3cf8e98965be281e39574b6b700';
var provPriv = 'ac929c64c13257ae7e26d95bbcd17af2';

var subPub = '044441a3e9da4f8cdbd85994e79c46f06da180e54cd3fa0a173bd1ded817ef37a5';
var subPriv = '215a3ed02876c7e910eabffadf353f73'


var ecdh = crypto.createECDH("secp128r1");

ecdh.setPrivateKey(provPriv, 'hex');
ecdh.setPublicKey(provPub, 'hex');

var secret = ecdh.computeSecret(subPub, 'hex');

var provCipher = crypto.createCipher(AES256, secret);
var provDecipher = crypto.createDecipher(AES256, secret);
var subCipher = crypto.createCipher(AES256, secret);
var subDecipher = crypto.createDecipher(AES256, secret);

var msg1 = "Hey prov, I'm sub";
var eMsg1 = provCipher.update(msg1, 'utf8', 'hex');
eMsg1 += provCipher.final('hex');
console.log("prov says (clear): " + msg1);
console.log("prov says (ciphered): " + eMsg1);
console.log('\n');

var dMsg1 = subDecipher.update(eMsg1, 'hex', 'utf8');
dMsg1 += subDecipher.final('utf8');
console.log("sub receives (ciphered): " + eMsg1);
console.log("sub receives (deciphered): " + dMsg1);
console.log('\n');