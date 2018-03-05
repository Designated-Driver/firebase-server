const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require('./service.json');
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
  var registrationToken = request.query.registrationToken

  var message = {
    notification: {
      title: 'Ride Requested',
      body: 'Would you like to respond to this ride?',
      click_action: "/",
      icon: 'https://raw.githubusercontent.com/Designated-Driver/client/master/static/img/icons/msapplication-icon-144x144.png',
    }
  };
  
  messaging.sendToDevice(registrationToken, message).then((res) => {
    return response.send(res)
  }).catch((err) => {
    console.log(err)
  })
})