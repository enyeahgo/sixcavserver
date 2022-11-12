var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: '6CAV SERVER' });
});

module.exports = router;
