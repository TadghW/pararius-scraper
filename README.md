### Pararius Scraper

This application uses Node.js and Puppeteer to scrape a list of settlements in the Netherlands for properties that fit your search parameters. It will find properties not yet in your database, gather information about them, and then upload them to a Firestore database.

It also contains a script to demonstrate how you can use that data to calculate price gradients between Dutch settlements and proxies for other information, like the competitiveness of a local housing market. 

You could deploy the scraper in a cloud environment and run it using a chron job, but given the slow churn rate of Dutch properties you might as well run daily on your own computer.

Please be respectful of Pararius's bandwidth and compute, you will be hit with a captcha that breaks the script if you pull too much information at once. For that reason I've kept the application single-threaded to minimize the bandwidth/time rate of the application.

 #### To use this application you will need:
 - Node.js
 - Npm or yarn
 - A Firebase project with a Firestore database and collection configured with the schema demonstrated in `index.mjs` 
 - Valid credentials to access your database

#### Setup:

 - **Clone the repository** with `git clone https://github.com/TadghW/pararius-scaper.git`
 - **Install the application's requirements** with `npm install` at the root of the project directory
 - **Create and populate firebaseConfig.json** file at the root of the directory 
- **Configure settings** in `config.mjs` to match your search criteria
- **Store your user credentials** JSON in a folder at the project's root


#### Usage:

- Use any of the three scripts as you see fit
	- `index.mjs` This is the script which scrapes pararius, filters the results and populates your database. No args required.
	- `stats.mjs` This is the script that does the example processing. No args required.
	- `clean_database.mjs` This script contains utilities to repair problems with data in your database, if you're fiddling with the script
