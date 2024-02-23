import puppeteer from 'puppeteer';
import config from './config.mjs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import firebaseConfig from './firebaseConfig.json' assert { type: 'json' };



async function findAllRelevantListings(page) {
  let listings = [];
  for(let location of config.targets) {
    console.log(`Checking for properties in ${location.name}...`)
    const parariusSearch = `https://www.pararius.com/apartments/${location.name}/${config.lowerLimit}-${config.upperLimit}/${config.bed}-bedrooms/${config.sqm}m2/indefinite`;
    try {
      let links = await getListingsFromPage(page, parariusSearch)
      console.log(`Links: ${JSON.stringify(links)}`)
      console.log(`Found ${links.length} listings...`)
      listings.push(...links)
    } catch (error) {
      console.error(`Failed to get listings at ${parariusSearch}`)
    }
  } 
  return listings
}

async function getListingsFromPage(page, parariusSearch) {
  await page.goto(parariusSearch, { waitUntil: 'networkidle2' });
  try {
    const links = await page.evaluate(() => {
      const listings = [];
      document.querySelectorAll('section.listing-search-item').forEach((element) => {
        const titleElement = element.querySelector('.listing-search-item__price').previousElementSibling;
        const title = titleElement ? titleElement.innerText : 'No title';
        const linkElement = element.querySelector('.listing-search-item__link--title');
        const link = linkElement ? linkElement.href : null;
        listings.push({ title, link });
      });
      return listings;
    });
    return links;
  } catch (error) {
    console.error(`Error while getting listings: ${error}`);
    return [];
  }
}

async function scrapeAndSerializeProperties(page, properties){

  let newPropertyObjects = []

    for(let i = 0; i < properties.length; i++){

      try {

        console.log(`Reading details of ${properties[i].title} @ ${properties[i].link}...`)
        
        const locationIsolator = /^(?:[^/]*\/){4}([^/]*)/;
        await page.goto(properties[i].link, { waitUntil: 'networkidle2' });
        
        let listingInfo = {
          "title": properties[i].title,
          "area": properties[i].link.match(locationIsolator)[1],
          "link": properties[i].link,
        }

        let info = await page.evaluate(() => {
          const price = document.querySelector('div.listing-detail-summary__price').innerText;
          const floorspace = document.querySelector('li.illustrated-features__item--surface-area').innerText;
          const bedrooms = document.querySelector('dd.listing-features__description--number_of_bedrooms span').innerText;
          const garden = document.querySelector('dd.listing-features__description--garden span')?.innerText;
          const balcony = document.querySelector('dd.listing-features__description--balcony span')?.innerText;
          const pets = document.querySelector('dd.listing-features__description--pets_allowed span')?.innerText;
          const lat = document.querySelector('wc-detail-map').getAttribute('data-latitude');
          const long = document.querySelector('wc-detail-map').getAttribute('data-longitude')
          return [price, floorspace, bedrooms, garden, balcony, pets, lat, long ];
        });

        listingInfo['price'] = Number(info[0].replace(/\D/g,''))
        listingInfo['floorspace'] = Number(info[1].replace(/\D/g,''))
        listingInfo['price/m'] = (listingInfo['price'] / listingInfo['floorspace'])
        listingInfo['bedrooms'] = Number(info[2].replace(/\D/g,''))
        listingInfo['garden'] = info[3]
        listingInfo['balcony'] = info[4]
        listingInfo['pets'] = info[5]
        listingInfo['lat'] = info[6]
        listingInfo['long'] = info[7]
        listingInfo['found'] = new Date().getTime();
        
        newPropertyObjects.push(listingInfo)

      } catch (error) {
        console.error(`Error getting property details for for ${properties[i].title} at ${properties[i].link}: ${error.message}`);
      }
    
    }
    
  return newPropertyObjects

}


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dbSnapshot = await getDocs(collection(db, "dutch_properties"));

const existingProperties = []

console.log(`Downloading old property listings from db...`)

dbSnapshot.forEach((doc) => {
  existingProperties.push(doc.data());
})

console.log(`Found ${existingProperties.length} listings in db.`)

console.log(`Scraping listings from Pararius...`)

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");

let activeListings = await findAllRelevantListings(page)

console.log(`Found ${activeListings.length} active listings.`)

const propertiesSeen = new Set();
let newProperties = activeListings.filter((listing) => {if(propertiesSeen.has(listing.title)){return false}else{propertiesSeen.add(listing.title); return true}})

console.log(`Accounting for duplicates by search are that's ${newProperties.length} listings`)

newProperties = activeListings.filter((listing) => !existingProperties.some(property => property.title === listing.title));

console.log(`${newProperties.length} of these listings aren't present in the database`)

const newPropertyObjects = await scrapeAndSerializeProperties(page, newProperties);

for(let i = 0; i < newPropertyObjects.length; i++){
  console.log(`Uploading new property ${(i+1)}...`)
  try {
    const docRef = await addDoc(collection(db, "dutch_properties"), newPropertyObjects[i]);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

console.log("Closing browser..")
await browser.close();
