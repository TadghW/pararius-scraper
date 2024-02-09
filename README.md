# Pararius Scraper

`index.mjs` => Puppeteer scraper grabs the front page of Pararius results within my parameters and uploads key information from them to a Firestore database. 

`stats.mjs` => Snapshots the db and calculates some basic metrics of each of the areas I collect information on

## Getting Started

If you want to run this you'll need:

- Node.js
- npm or yarn
- Google Cloud account
- Firebase project with Firestore configured for access with schema and collection referenced in index.mjs

### Installing

1. **Clone the repository**

```bash
git clone https://github.com/tadghw/pararius_scraper.git
cd pararius_scraper
npm install
```

2. **Setup your firebase project and configure your firestore database**

3. **Populate a firebaseConfig.json with your firebase config info**

4. **Set configuration details in config.mjs as you see fit**

5. `node index.mjs` to run the scraping and uploading tool

6. `stats.mjs` to run the summary tool
``` to print stats
