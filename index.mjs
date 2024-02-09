import puppeteer from 'puppeteer';
import config from './config.mjs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVgDM4id8HpNCf3a9ow6EAd15sNJJ5KV4",
  authDomain: "property-scrape-e0ac1.firebaseapp.com",
  projectId: "property-scrape-e0ac1",
  storageBucket: "property-scrape-e0ac1.appspot.com",
  messagingSenderId: "18166764100",
  appId: "1:18166764100:web:e04560913c6d956df9e211"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function scrapePararius() {

  const dbSnapshot = await getDocs(collection(db, "dutch_properties"));
  
  const existingProperties = []

  console.log(`Downloading old property listings from db...`)

  dbSnapshot.forEach((doc) => {
    existingProperties.push(doc.data());
  })

  console.log(`Found ${existingProperties.length} listings in db.`)

  console.log(`Scraping Pararius for new listings...`)

  const browser = await puppeteer.launch();

  let results = [];

  for (let location of config.dutch_targets) {
    
    const parariusSearch = `https://www.pararius.com/apartments/${location}/0-2400/${config.bed}-bedrooms/upholstered/${config.sqm}m2/indefinite`;
    
    try {

      const page = await browser.newPage();

      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");

      let links = await getPListings(page, parariusSearch)

      console.log(`All listings => ${JSON.stringify(links)}`)

      for(let i = 0; i < links.length; i++){
        console.log(`Hitting ${links[i].title} @ ${links[i].link}...`)
        await page.goto(links[i].link, { waitUntil: 'networkidle2' });
        let listingInfo = {
          "title": links[i].title,
          "area": location,
          "link": links[i].link,
        }
        let info = await page.evaluate(() => {
          const price = document.querySelector('div.listing-detail-summary__price').innerText;
          const floorspace = document.querySelector('li.illustrated-features__item--surface-area').innerText;
          const bedrooms = document.querySelector('dd.listing-features__description--number_of_bedrooms span').innerText;
          const garden = document.querySelector('dd.listing-features__description--garden span').innerText;
          const balcony = document.querySelector('dd.listing-features__description--balcony span').innerText;
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
        results.push(listingInfo)
      }

      console.log(results);
    } catch (error) {
      console.error(`Error getting pararius results for ${location}: ${error.message}`);
    }
  }

  console.log("Closing browser..")
  await browser.close();
  console.log("Filtering results..")
  const uniqueByTitle = results.reduce((accumulator, current) => {
    if (!accumulator.seen[current.title]) {
      accumulator.result.push(current);
      accumulator.seen[current.title] = true;
    }
    return accumulator;
  }, { seen: {}, result: [] }).result; // Initialize with an object holding seen titles and the result array
  console.log(`Found properties: ${uniqueByTitle}`);
  console.log(`Checking against existing properties...`)
  const newProperties = uniqueByTitle.filter(obj2 =>
    !existingProperties.some(obj1 => obj1.title === obj2.title));
  console.log(`New properties =>`);
  console.log(JSON.stringify(newProperties));
  console.log(`Uploading new ${newProperties.length} properties...`)
  for(let i = 0; i < newProperties.length; i++){
    console.log(`Uploading new property ${(i+1)}...`)
    try {
      const docRef = await addDoc(collection(db, "dutch_properties"), newProperties[i]);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

}

async function getPListings(page, parariusSearch) {

  console.log(`Hitting ${parariusSearch}...`);

  page.on('console', msg => console.log('Browser says:', msg.text()));

  await page.goto(parariusSearch, { waitUntil: 'networkidle2' });
  console.log('Page loaded..');

  try {
    const links = await page.evaluate(() => {
      const listings = [];
      let elements = document.querySelectorAll('.listing-search-item');
      console.log(`Listings found: ${elements.length}`);
      document.querySelectorAll('section.listing-search-item').forEach((element) => {
        console.log('Checking listing...');
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

scrapePararius();
