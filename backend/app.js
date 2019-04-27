const express = require('express')
const app = express()
const port = 3000
const admin = require("firebase-admin");
const serviceAccount = require("./assets/serviceAccountKey.json");

class firebaseAdmin {
    constructor(credentials) {
        this.credentials = credentials;
        this.db = null;
        this.docRef = null;
        this.testDocRef = null;
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
        this.docRef.set({
            soilMoisture: 5,
            waterLevel: 6,
            isConserving: true
        });
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

var arduinoData = {};
fb.storeData(arduinoData)

app.get('/', (req, res) => res.send('Arduino data collection server is running!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))