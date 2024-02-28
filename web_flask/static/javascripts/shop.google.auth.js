import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAM3MhHSsLZMc0KIFjGgVYdmT-ZOMtPF2E',
  authDomain: 'cc-estore.firebaseapp.com',
  projectId: 'cc-estore',
  storageBucket: 'cc-estore.appspot.com',
  messagingSenderId: '361500813180',
  appId: '1:361500813180:web:5df54d5e756e8fcfe6e6f9'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

$(() => {
  $('#google-login').on('click', function () {
    console.log('clicked');
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;

        console.log(user);
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  });
});
