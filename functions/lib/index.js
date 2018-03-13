"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// Event to fire when a new cake has been inserted into our 'cakes' node
exports.onNewCake = functions.database.ref('/cakes/{cakeId}').onCreate(event => {
    const newCakeId = event.params.cakeId; // Get the key of the new cake for later use in this function
    if (!event.data.val()) {
        return;
    }
    const newCake = event.data.val(); // Get the new cake object from the event
    const cakeReferance = admin.database().ref('/cakes/' + newCakeId); // Get a referance to our new cake in the database
    const today = new Date();
    // Set the "sell by" date
    let sellBy = new Date().setDate(today.getDate() + 3);
    // Set the "use by" date
    let useBy = new Date().setDate(today.getDate() + 4);
    // Update our cake record with the new dates
    cakeReferance.update({ sellByDate: new Date(sellBy).toUTCString(), useByDate: new Date(useBy).toUTCString() });
});
exports.getCakes = functions.https.onRequest((req, res) => {
    const cakeId = req.query.cakeId; // This is how we get variables form the GET request
    console.log("Cake ID: " + cakeId); // We will log this just to show we have it
    const today = new Date();
    const getCakesPromise = admin.database().ref(`/cakes/`).once('value');
    return Promise.all([getCakesPromise]).then(cakesResults => {
        const cakes = cakesResults[0].val();
        for (let cakeKey in cakes) {
            let cake = cakes[cakeKey];
            if (cake.useByDate) {
                let useByDate = new Date(cake.useByDate);
                cake['status'] = today.getTime() > useByDate.getTime() ? "Out of date" : "Safe to eat";
            }
            cakes[cakeKey] = cake;
        }
        res.status(200).send(JSON.stringify(cakes));
    });
});
//# sourceMappingURL=index.js.map