import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/database';

var firebaseConfig = {
   apiKey: "AIzaSyCo3Iv1XlO9liolvMrBiw3ZSgVu_Ep5_VU",
   authDomain: "chaterpillar-eba3a.firebaseapp.com",
   databaseURL: "https://chaterpillar-eba3a.firebaseio.com",
   projectId: "chaterpillar-eba3a",
   storageBucket: "chaterpillar-eba3a.appspot.com",
   messagingSenderId: "339828222954",
   appId: "1:339828222954:web:3692d00ab1ca70be92a093",
   measurementId: "G-2NPW6J1QJK"
 };


firebase.initializeApp(firebaseConfig);


export default firebase;
