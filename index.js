require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { appendFileSync } = require('fs');
const dns = require('dns');
const { AppDAO, UrlRepo } = require('./db');

appendFileSync('./data.db', '');
const dao = new AppDAO('./data.db');
const urlRepo = new UrlRepo(dao);
urlRepo.createTable();
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:url_id', (req, res) => {
  let { url_id } = req.params;
  urlRepo
    .getById(url_id)
    .then((result) => {
      result
        ? res.redirect(result.original_url)
        : res.send('<h1>Page Not Found</h1>');
    })
    .catch((err) => {
      res.send('<h1>Internal Server Error</h1>');
    });
});

app.post('/api/shorturl', (req, res) => {
  const $original_url = req.body.url;
  const isValidURL = (input_url) => {
    return new Promise((resolve, reject) => {
      if (!input_url.match(/^(http(s)?:\/\/)/)) {
        reject(false);
      }
      let urlObj;
      try {
        urlObj = new URL(input_url);
      } catch (error) {
        reject(false);
      }
      dns.lookup(urlObj.hostname, (err, address, family) => {
        if (err) {
          reject(false);
        } else resolve(true);
      });
    });
  };
  isValidURL($original_url)
    .then((result) => {
      urlRepo
        .getByURL($original_url)
        .then((result) => {
          if (result) {
            res.json({ original_url: $original_url, short_url: result.id });
          } else {
            urlRepo
              .create($original_url)
              .then((result) => {
                return res.json({
                  original_url: $original_url,
                  short_url: result.id
                });
              })
              .catch((err) => {
                return res.send('<h1>Internal Server Error</h1>');
              });
          }
        })
        .catch((err) => {
          res.send('<h1>Internal Server Error</h1>');
        });
    })
    .catch((err) => {
      res.json({ error: 'invalid url' });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
