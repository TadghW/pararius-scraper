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
  const average = Number((sum / listingsByArea[area].length).toFixed(0));
  return { area, average };
}).sort((a, b) => a.average - b.average);

const areasByAveragePriceSqm = Object.keys(listingsByArea).map(area => {
  const sum = listingsByArea[area].reduce((acc, listing) => acc + listing['price/m'], 0);
  const average = Number((sum / listingsByArea[area].length).toFixed(1));
  return { area, average };
}).sort((a, b) => a.average - b.average);

const areasByListings = Object.keys(listingsByArea).map(area => {
    const listings = listingsByArea[area].length;
    return { area, listings };
  }).sort((a, b) => b.listings - a.listings);

  const areasByPopToListing = Object.keys(listingsByArea).map(area => {
    console.log(`area => ${area}`)
    const listings = listingsByArea[area].length;
    const target = config.targets.find(target => target.name === area);
    const pop = target.population;
    const popToListing = Number((pop / listings).toFixed(0));
    return { area, popToListing };
  }).sort((a, b) => a.popToListing - b.popToListing);

console.log(`Areas by average price =>`)
console.log(areasByAveragePrice)
console.log(`Areas by average price/sqm =>`)
console.log(areasByAveragePriceSqm)
console.log(`Areas by published listings =>`)
console.log(areasByListings)  
console.log(`Areas by inhabitant per listing =>`)
console.log(areasByPopToListing)

console.log(`Gating areas by minimum ${config.minListings} listings, minimum ${config.minPopulation} population, maximum ${config.maxCommute} minute commute time...`)

const gatedAreasByPrice = areasByAveragePrice.filter(area => {
  const target = config.targets.find(target => target.name === area.area);
  const areaListings = listingsByArea[area.area];
  return target.population > config.minPopulation && areaListings.length > config.minListings;
});

const gatedAreasBySqm = areasByAveragePriceSqm.filter(area => {
  const target = config.targets.find(target => target.name === area.area);
  const areaListings = listingsByArea[area.area];
  return target.population > config.minPopulation && areaListings.length > config.minListings;
});

const gatedAreasByListings = areasByListings.filter(area => {
  const target = config.targets.find(target => target.name === area.area);
  const areaListings = listingsByArea[area.area];
  return target.population > config.minPopulation && areaListings.length > config.minListings;
});

const gatedAreasByPopToListing = areasByPopToListing.filter(area => {
  const target = config.targets.find(target => target.name === area.area);
  const areaListings = listingsByArea[area.area];
  return target.population > config.minPopulation && areaListings.length > config.minListings;
});

  console.log(`Areas by average price =>`)
  console.log(gatedAreasByPrice)
  console.log(`Areas by average price/sqm =>`)
  console.log(gatedAreasBySqm)
  console.log(`Areas by published listings =>`)
  console.log(gatedAreasByListings)  
  console.log(`Areas by inhabitant per listing =>`)
  console.log(gatedAreasByPopToListing)

