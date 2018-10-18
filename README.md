# btslr.co

Bitsler's link shortener

### Setup
- Clone this repository
- Create a `.env` file in the project's root directory using the example below
- Install the dependencies `npm install` or `yarn install`
- Run the app `node index.js`


### API Routes

- shorten - `/shorten`
 - query parameters - `url` the bitsler.com url that you want to shorten. Subdomains are allowed too.
- stats - `/stats`
  - query parameters - `label` which type of stats you want to see. Only accepts `links` and `users` values.

### Limitations

- This is made for bitsler.com domain, however, that limitation can be changed on your `.env` file
- This only works for single .tld domains, so domains with tlds such as `.co.uk` will not work