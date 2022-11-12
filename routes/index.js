var express = require('express');
var router = express.Router();
var top = require('../helpers/top');
var bottom = require('../helpers/bottom');
var closing = require('../helpers/closing');

router.get('/', (req, res) => {
	res.send(`
		${top('6Cav Server')}
		${bottom}
		<script>
			window.addEventListener('load', () => {
				Swal.fire('Hello World', 'Welcome to 6Cav Server', 'success');
			});
		</script>
		${closing}
	`);
});

module.exports = router;
