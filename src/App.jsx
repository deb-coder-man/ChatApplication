/* eslint-disable react/prop-types */
import './App.css'

//Firebase is suite of cloud-based tools and services to help developers build, improve, and scale applications quicly.

//The below are things from firebase
import { initializeApp } from 'firebase/app'; //Initalises the firebase software developement kit (SDK, to be able to use all the firebase toosl)
import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore'; //Firestore is the noSQL databse created by firebase
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; //Auth is used for user authenciation within firebase

import { useAuthState } from 'react-firebase-hooks/auth'; //React hook used to store whenever a change in authetication happens. 
import { useCollectionData } from 'react-firebase-hooks/firestore'; //React hook used to get the documents in a collection
import React from 'react';

/* This is used to initialise an instance of firebase, so you could use the services,
   inside the brackets you would put your firebase project so you know what project
   to connect to when you use the firebase service. */
const firebaseConfig = {
  apiKey: "AIzaSyAv60mK-Y9lKQEgqMLdI_1GD7f6c7BVnAI",
  authDomain: "superchat-a5977.firebaseapp.com",
  projectId: "superchat-a5977",
  storageBucket: "superchat-a5977.appspot.com",
  messagingSenderId: "408016073320",
  appId: "1:408016073320:web:576a3eb14069a2c50781dd",
  measurementId: "G-DNT48Y8BSW"
};

const app = initializeApp(firebaseConfig); //Initialises the firebase based on the config settting

const auth = getAuth(app); //Gets the authentication service from my firebase
const firestore = getFirestore(app); //Gets the firestore (databse) service from my database



function App() {

  /* The useAuthState will return null is the user is not logged in
     and return an object containing user information if logged in */
  const [user] = useAuthState(auth);

  //Instead of using react hook for firebase we can use the onAuthStateChanged function from firebase/auth, as shown below
  /*const [current,SetCurrent] = React.useState(false);

  onAuthStateChanged(auth, (user) =>{
    if (user) {
      SetCurrent(true);
      console.log(user.uid);
      console.log(user.email);
    } else {
      SetCurrent(false)
      console.log("No user logged in");
    }
  }); */

  
  return (
    <>
      {user ? (     
        <>   
          <ChatRoom/>
        </>
      ) : <SignIn/>}    
    </>
  )
}


function SignIn() {

  const signInWithGoogle = () => {
    /* When the user logged in, if they are a new user 
       a new entry will automatically be created in firebase
       if they are an exisiting user they will be authenticated
       and sent to their existing entry */
    const provider = new GoogleAuthProvider(); //Defining what authentication provider the user will use
    signInWithPopup(auth, provider); //Creating a pop up window to allow the user to log themselves in
    
  }

  return (
    <div>
      <button onClick={signInWithGoogle} >Sign in with a google account</button>
    </div>
  )

}

function ChatRoom() {

  /* When a user creates a message it will be stored as a document (object)
     inside a collection, the below code is used to get that collection
     meaning messageRef stores all the messages sent by users */
  const messagesRef = collection(firestore, 'messages'); //'message' is the ID of the collection in firestore
  const q = query(messagesRef, orderBy('createdAt'), limit(100)); //This fetches the latest (shown by 'createdAt' filed) 25 docuements inside the collection

  /* useCollectionData is used to update the messages object whenever a
     change occurs in the firestore database in real time. The idFile parameters
     allows us to also return the id of the document, with this parameter
     the message object would only contain the document data i.e. the
     messages sent by the user */
  const [messages] = useCollectionData(q);

  const [messageValue, setMessageValue] = React.useState(''); //State variable used to store the message a user sends

  const sendMessage = async(e) => {
    e.preventDefault(); //Used to stop the page from refreshing, as if you click submit this will usually reset the page. 
    const { uid, photoURL, displayName } = auth.currentUser; //Getting the uid and photoURL of the user sending the message.

    // messagesRef refers to the collection where all the messages are stored, in takes a js object as parameter, which represents the fields

    await addDoc(messagesRef, {
      text: messageValue,
      createdAt: serverTimestamp(),
      displayName,
      uid,
      photoURL
    });

    setMessageValue('') //Resets the messageValue to an empty string after the message is sent
    dummy.current.scrollIntoView({ behavior: 'smooth' }); //Scrolls to the bottom of the page whenever a new message is sent
  }

  const dummy = React.useRef(); //Used to scroll to the bottom of the page whenever a new message is sent

  return (
    <div>
    <div className='header'>
      <h1>I'M IN THE THICK OF IT</h1>
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
      {
        messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>) 
      }
      <div ref={dummy}></div>
    <form className='messageForm' onSubmit={sendMessage}>
      <input placeholder="Type Here..." value={messageValue} onChange={(e) => setMessageValue(e.target.value)} />
      <button type="submit"></button>
    </form>
    </div>
  )

}

function ChatMessage(props) {
  const {text, uid, photoURL, displayName} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      {messageClass === 'received' && <img className='photoURL' src={photoURL} />}
      <div className='text-info'>
        {messageClass === 'received' && <h3 className='displayName'>{displayName}</h3>}
        {messageClass === 'received' ? <p className='text'>{text}</p> : <p className='text-sent'>{text}</p>}
      </div>
    </div>
  )

}

export default App
