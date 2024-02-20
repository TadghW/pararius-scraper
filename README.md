# Pararius Scraper

`index.mjs` => Puppeteer scrapes the most recent page of Pararius results that fit within your parameters, uploads information of any not already in your Firestore database to it. 

`stats.mjs` => Breaks down the rental market by area based on the information inside your Firestore database.

## Getting Started

If you want to run this you'll need:

- Node.js
- npm or yarn
- Google Cloud account
- Firebase project with Firestore configured for access with schema and collection demonstrated in index.mjs

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
