var express = require('express');
var router = express.Router();
var top = require('../helpers/top');
var bottom = require('../helpers/bottom');
var closing = require('../helpers/closing');

router.get('/', (req, res) => {
	res.redirect('/home');
});

router.get('/:page', (req, res) => {
	let title = req.params.page;
	let items = ["Hello World!", "My name is INIGO OROSCO.", "I am a Programmer."];
	res.render('index', {
		top: top(title),
		content: `<ul><li>${items.join('</li><li>')}</li></ul>`,
		bottom: bottom, closing: closing
	});
});

module.exports = router;
