const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const firebaseDB = admin.database()

exports.requestRide = functions.https.onRequest((request, response) => {
  var startLocation = request.query.startPos
  var endLocation = request.query.endPos
  var numPeople = request.query.numPeople
  var riderID = request.query.riderID

  // Open a new rider transaction for the ride request.
  firebaseDB.ref('rides/newData').set({
    startLocation: startLocation,
    endLocation: endLocation,
    numPeople: numPeople,
    riderID: riderID
  })

  firebaseDB.ref(`users/online/riders/currentlyIdle/${riderID}`).once('value').then(snapshot => {
    return firebaseDB.ref(`users/online/riders/currentlyOnTrip/${riderID}`).set(snapshot.val())
  }).then(() => {
    return firebaseDB.ref(`users/online/riders/currentlyIdle/${riderID}`).remove()
  }).catch(err => {
    console.log(err)
  })


  response.send(`The start location is ${startLocation} and the end location is ${endLocation}`)
});
