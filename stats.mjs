import config from './config.mjs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseConfig from './firebaseConfig.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log(`Downloading listings from db...`)

let listings = [];

const dbSnapshot = await getDocs(collection(db, "dutch_properties"));

dbSnapshot.forEach((doc) => {
  listings.push(doc.data());
})

const listingsByArea = listings.reduce((acc, listing) => {
    acc[listing.area] = acc[listing.area] || [];
    acc[listing.area].push(listing);
    return acc;
  }, {});

const areasByAveragePrice = Object.keys(listingsByArea).map(area => {
  const sum = listingsByArea[area].reduce((acc, listing) => acc + listing.price, 0);
  const average = (sum / listingsByArea[area].length).toFixed(1);
  return { area, average };
}).sort((a, b) => a.average - b.average);

const areasByAveragePriceSqm = Object.keys(listingsByArea).map(area => {
  const sum = listingsByArea[area].reduce((acc, listing) => acc + listing['price/m'], 0);
  const average = (sum / listingsByArea[area].length).toFixed(1);
  return { area, average };
}).sort((a, b) => a.average - b.average);

const areasByListings = Object.keys(listingsByArea).map(area => {
    const listings = listingsByArea[area].length;
    return { area, listings };
  }).sort((a, b) => b.listings - a.listings);

console.log(`Areas by average price =>`)
console.log(areasByAveragePrice)
console.log(`Areas by average price/sqm =>`)
console.log(areasByAveragePriceSqm)
console.log(`Areas by published listings =>`)
console.log(areasByListings)  
