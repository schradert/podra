import firebase from 'firebase';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    apiKey: "AIzaSyCbWtWXGfev-dpVMgEyevvimX-Xmv76pls",
    authDomain: "browser-shelf.firebaseapp.com",
    databaseURL: "https://browser-shelf.firebaseio.com",
    projectId: "browser-shelf",
    storageBucket: "browser-shelf.appspot.com",
    messagingSenderId: "944054137525",
    appId: "1:944054137525:web:fac34c93833ab6535304fc",
    measurementId: "G-5HRC3VEVWY"
};

firebase.initializeApp(config);
// firebase.analytics(); ==> not supported in Node or Chrome extensions

export default firebase;