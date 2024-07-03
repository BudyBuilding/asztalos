import firebase from 'firebase/app';
import 'firebase/auth';

// Firebase konfiguráció inicializálása
/*
const firebaseConfig = {
  apiKey: "AIzaSyD38z0nXaplg6dVmYmKpD_td4Gj0mAYBeg",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "asztalos-a5496",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};*/

/*
Project name
asztalos
Project ID 
asztalos-a5496
Project number 
1031650650938
Default GCP resource location 
Not yet selected
Web API Key
AIzaSyD38z0nXaplg6dVmYmKpD_td4Gj0mAYBeg
*/

/*
const firebaseConfig = {
  apiKey: "AIzaSyD38z0nXaplg6dVmYmKpD_td4Gj0mAYBeg",
//  authDomain: "cv-site-10ad3.firebaseapp.com",
  databaseURL: "https://cv-site-10ad3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cv-site-10ad3",
  storageBucket: "cv-site-10ad3.appspot.com",
  messagingSenderId: "125941372972",
  appId: "1:125941372972:web:46adf68b746edebc9ed989",
  measurementId: "G-RS8V2SM423"
};

*/


// Firebase inicializálása
/*
firebase.initializeApp(firebaseConfig);

// Bejelentkezés függvény
const signInWithEmailAndPassword = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password);
}

// Példa bejelentkezési űrlap űrlapkezelője
const handleSignIn = async (event) => {
  event.preventDefault();
  const email = event.target.email.value;
  const password = event.target.password.value;

  try {
    await signInWithEmailAndPassword(email, password);
    console.log('Sikeres bejelentkezés!');
  } catch (error) {
    console.error('Hiba történt a bejelentkezés során:', error);
  }
}*/
