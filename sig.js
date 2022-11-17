var path = require('path');
const JSONFileStorage = require('node-json-file-storage');
const file_uri = path.join(__dirname, 'public/storage/sig.json');
const sigdb = new JSONFileStorage(file_uri);

module.exports = sigdb;