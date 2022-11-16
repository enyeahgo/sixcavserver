var path = require('path');
const JSONFileStorage = require('node-json-file-storage');
const file_uri = path.join(__dirname, 'public/hierarchy.json');
const hierarchy = new JSONFileStorage(file_uri);

module.exports = hierarchy;