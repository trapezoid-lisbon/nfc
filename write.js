// without Babel in ES2015
const { NFC, KEY_TYPE_A, KEY_TYPE_B } = require('nfc-pcsc');
const ndef = require('ndef');
const ethers = require('ethers');
const mifare = require('mifare-classic');

// parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.log('Usage: node write.js <address> <amount> <denom>');
    process.exit(1);
}
const [address, amount, denom] = args;


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

        message = [ndef.textRecord(address), ndef.textRecord(amount), ndef.textRecord(denom)]
        bytes = ndef.encodeMessage(message)
        console.log("bytes", bytes, bytes.length)

        dumpNdefToFile(bytes, 'write.ndef')
        mifare.write(bytes, function (err) {
            if (err) {
                console.log("Write failed ");
                console.log(err);
            } else {
                console.log("OK");
            }
        });
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

function dumpNdefToFile(bytes, filename) {
    // open a file called 'wtf.bin' and write bytes to it
    const fs = require('fs');
    const file = fs.createWriteStream(filename);
    file.on('error', function(err) { console.log(err); });
    file.write(Uint8Array.from(bytes));
    file.end();
}
