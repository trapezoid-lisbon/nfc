// without Babel in ES2015
const { NFC, KEY_TYPE_A, KEY_TYPE_B } = require('nfc-pcsc');
const ndef = require('ndef');
const ethers = require('ethers');
const mifare = require('mifare-classic');


const nfc = new NFC(); // optionally you can pass logger

nfc.on('reader', reader => {

    console.log(`${reader.reader.name}  device attached`);

    // enable when you want to auto-process ISO 14443-4 tags (standard=TAG_ISO_14443_4)
    // when an ISO 14443-4 is detected, SELECT FILE command with the AID is issued
    // the response is available as card.data in the card event
    // see examples/basic.js line 17 for more info
    reader.aid = 'F222222222';

    reader.on('card', async card => {

        // card is object containing following data
        // [always] String type: TAG_ISO_14443_3 (standard nfc tags like MIFARE) or TAG_ISO_14443_4 (Android HCE and others)
        // [always] String standard: same as type
        // [only TAG_ISO_14443_3] String uid: tag uid
        // [only TAG_ISO_14443_4] Buffer data: raw data from select APDU response

        console.log(`${reader.reader.name}  card detected`, card);

        try {
            mifare.read(function(err, buffer, uid) {
                if (err) {
                    console.log("Read failed ");
                    console.log(err);
                } else {
                    var message = ndef.decodeMessage(buffer);

                    console.log('\nTag UID is', uid);
                    console.log("Found NDEF message with " + message.length +
                        (message.length === 1 ? " record" : " records" ));
                    console.log(ndef.stringify(message));
                }});
        } catch (err) {
            console.error(`error when reading data`, err);
        }
    });

    reader.on('card.off', card => {
        console.log(`${reader.reader.name}  card removed`, card);
    });

    reader.on('error', err => {
        console.log(`${reader.reader.name}  an error occurred`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name}  device removed`);
    });

});

nfc.on('error', err => {
    console.log('an error occurred', err);
});

async function sendTx(signedTx) {
//     const cro = sdk.CroSDK({ network: sdk.CroNetwork.Testnet });
//     const client = await cro.CroClient.connect();
//     await client.broadcastTx(signedTx.encode().toUint8Array());
    const cronosRpc = ethers.providers.JsonRpcProvider("https://evm.cronos.org/")
}
