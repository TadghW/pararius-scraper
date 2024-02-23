import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, deleteDoc, where, doc } from "firebase/firestore";
import firebaseConfig from './firebaseConfig.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Define the function to remove entries with empty or non-existent field
// I used this when testing to remove listings I scraped with broken fields
async function removeEntriesWithEmptyArea(field) {
    
    const collectionRef = collection(db, 'dutch_properties');
    const querySnapshot = await getDocs(collectionRef);
    const docsWithoutField = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data[field] === undefined) { // Check if 'area' field does not exist
        docsWithoutField.push(doc);
      }
    });

    console.log(`Found ${docsWithoutField.length} documents with a missing area field`)
    
  for (const doc of docsWithoutField) {
    console.log(`Deleting doc id: ${doc.id}`);
    await deleteDoc(doc.ref);
  }

  console.log(`Deleted all entries with empty ${field} field.`);
}

// Remove duplicate entries in the collection. I used this when I refactored and forgot 
// to account for properties showing up in the results of multiple areas
async function removeDuplicateEntriesByTitle() {

  const collectionRef = collection(db, 'dutch_properties');
  const querySnapshot = await getDocs(collectionRef);

  const titleToDocId = new Map(); 
  const duplicates = []; 

  querySnapshot.forEach(doc => {
    const title = doc.data().title;
    if (titleToDocId.has(title)) {
      duplicates.push(doc.id);
    } else {
      titleToDocId.set(title, doc.id);
    }
  });

  for (const docId of duplicates) {
    await deleteDoc(doc(db, "dutch_properties", docId))
    console.log(`Deleted document with ID: ${docId}`);
  }

  console.log(`${duplicates.length} duplicate documents deleted.`);

}

//removeEntriesWithEmptyArea('area').catch(console.error);
removeDuplicateEntriesByTitle().catch(console.error);