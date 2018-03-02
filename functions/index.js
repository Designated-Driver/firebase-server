const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require('../service.json');
var config = {
  apiKey: "AIzaSyCNtTlfQ0rbHqcrKCCuOJL9l8AuzPXx_58",
  credential: admin.credential.cert(serviceAccount),
  authDomain: "designated-driv.firebaseapp.com",
  databaseURL: "https://designated-driv.firebaseio.com",
  projectId: "designated-driv",
  storageBucket: "designated-driv.appspot.com",
  messagingSenderId: "427262799693"
};
admin.initializeApp(config);

const firebaseDB = admin.database()
const messaging = admin.messaging()

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

exports.sendMessage = functions.https.onRequest((request, response) => {

  var registrationToken = "cnW-HGCJanY:APA91bEQqpY8Y4fr_RY_8aVsNbnZBbJ4XxIx3mu-f-rpDuP1V0eDEN8IOcrBpEo4gqOZoNaxfgCEoa5bgUd9o4egCnBYTTOhpPxN3M4-eS4jcH6Rot9-M0rlc9F0oXRlp3hS4iKokSvQ"
  var message = {
    notification: {
      title: 'Ride Requested',
      body: 'Would you like to respond to this ride?'
    }
  };
  
  messaging.sendToDevice(registrationToken, message).then((res) => {
    return response.send(res)
  }).catch((err) => {
    console.log(err)
  })
})