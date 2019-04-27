const express = require('express')
const app = express()
const port = 3000
const admin = require("firebase-admin");
const serviceAccount = require("./assets/serviceAccountKey.json");

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
var serialPort = new SerialPort("/dev/cu.usbmodem144201", {
  baudRate: 9600
});
const parser = new Readline()
serialPort.pipe(parser);

class firebaseAdmin {
    constructor(credentials) {
        this.credentials = credentials;
        this.db = null;
        this.docRef = null;
        this.testDocRef = null;
        this.counter = 0;
        this.waterLevelLog = [];
    }

    init() {
        admin.initializeApp({
            credential: admin.credential.cert(this.credentials),
            databaseURL: "https://common-app-fb.firebaseio.com"
        });
        this.db = admin.firestore();
    }

    // Data retrieval methods
    initReference() {
        this.docRef = this.db.collection('testCollection').doc('testDocument');
    }

    storeData(data) {
        this.counter++;
        if (this.counter = 1000) {
            this.counter = 0;
        }
        if (this.counter / 5) {
            if (this.waterLevelLog.length < 10) {
                this.waterLevelLog.push(data.waterLevel);
            } else {
                this.waterLevelLog.shift();
                this.waterLevelLog.push(data.waterLevel);    
            }
        }
        data.waterLevelLog = this.waterLevelLog;
        data.timestamp = new Date();
        data.soilMoisture = 1023 - data.soilMoisture;
        this.docRef.set(data);
    }

    // Testing Methods
    // testInitDocReferences() {
    //     this.testDocRef = this.db.collection('testCollection').doc('testDocument');
    // }
    // testData() {
    //     const docRef = this.testDocRef;
    //     var checkViewport = setInterval(function() {
    //         let newSoilMoisture = Math.floor(Math.random() * 10);
    //         let newWaterLevel = Math.floor(Math.random() * 10);
    //         let newIsConserving = Math.floor(Math.random() * 10);
    //         docRef.set({
    //             soilMoisture: newSoilMoisture,
    //             waterLevel: newWaterLevel,
    //             isConserving: newIsConserving
    //         });
    //     }, 1000);
    // }
}


const fb = new firebaseAdmin(serviceAccount);
fb.init();
// fb.testInitDocReferences();
// fb.testData();
fb.initReference();

serialPort.on("open", function () {
  console.log('Serial communication open');
});

parser.on('data', line => {
   let values = JSON.parse(line);
   let data = {
      waterLevel: values[0],
      soilMoisture: values[1],
      servoPosition: values[2],
      isConserving: values[2] < 75
   }
   fb.storeData(data);
   console.log("> " + line);
});

app.get('/', (req, res) => res.send('Arduino data collection server is running!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))