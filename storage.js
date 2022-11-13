var path = require('path');
const JSONFileStorage = require('node-json-file-storage');
const file_uri = path.join(__dirname, 'storage/serverstorage.json');
const storage = new JSONFileStorage(file_uri);

module.exports = storage;