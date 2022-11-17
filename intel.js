var path = require('path');
const JSONFileStorage = require('node-json-file-storage');
const file_uri = path.join(__dirname, 'public/storage/intel.json');
const inteldb = new JSONFileStorage(file_uri);

module.exports = inteldb;