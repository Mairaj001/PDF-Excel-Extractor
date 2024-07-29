
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getDatabase, ref, set, push , get} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhhUD3AQTaqOn2GX6ttNlKLEwXzscoiGw",
  authDomain: "corey-database.firebaseapp.com",
  projectId: "corey-database",
  storageBucket: "corey-database.appspot.com",
  messagingSenderId: "748481790160",
  appId: "1:748481790160:web:e35cea3988f202c06e5ed5",
  measurementId: "G-65520HC134"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);


export  async function add_to_items(newItem) {
    const dbRef = ref(database, 'items');
  
    // Get current items
    try {
      const snapshot = await get(dbRef);
      let items = snapshot.val() || [];
  
      // Add the new item
      items.push(newItem);
  
     
      if (items.length > 10) {
        items.shift(); // Remove the oldest item
      }
  
      
      await set(dbRef, items);
      console.log('Items updated successfully!');
    } catch (error) {
      console.error('Error updating items:', error);
    }
  }



export async function get_items() {
    const dbRef = ref(database, 'items');
  
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error retrieving items:', error);
      return [];
    }
  }



export async function updateActivationDeactivation(activation, deactivation) {
    try {
      const activationRef = ref(database, 'activation');
      const deactivationRef = ref(database, 'deactivation');
  
      // Set the new values
      await set(activationRef, activation);
      await set(deactivationRef, deactivation);
  
      console.log('Activation and Deactivation values updated successfully');
    } catch (error) {
      console.error('Error updating Activation and Deactivation values:', error);
    }
  }


  export async function getActivationDeactivation() {
    try {
      const activationRef = ref(database, 'activation');
      const deactivationRef = ref(database, 'deactivation');
  
      // Retrieve data from both nodes
      const activationSnapshot = await get(activationRef);
      const deactivationSnapshot = await get(deactivationRef);
  
      // Check if data exists and return the object
      const activation = activationSnapshot.exists() ? activationSnapshot.val() : null;
      const deactivation = deactivationSnapshot.exists() ? deactivationSnapshot.val() : null;
  
      return { activation:activation,deactivation: deactivation };
    } catch (error) {
      console.error('Error retrieving Activation and Deactivation values:', error);
      return { activation: null, deactivation: null };
    }
}