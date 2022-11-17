var path = require('path');
const JSONFileStorage = require('node-json-file-storage');
const file_uri = path.join(__dirname, 'public/storage/trg.json');
const trgdb = new JSONFileStorage(file_uri);

module.exports = trgdb;