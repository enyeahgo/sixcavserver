var express = require('express');
var router = express.Router();
var top = require('../helpers/top');
var bottom = require('../helpers/bottom');
var closing = require('../helpers/closing');

router.get('/', (req, res) => {
	res.redirect('/home');
});

router.get('/home', (req, res) => {
	let items = ["Hello World!", "My name is INIGO OROSCO.", "I am a Programmer."];
	res.render('index', {
		top: top('home'),
		content: `<ul><li>${items.join('</li><li>')}</li></ul>`,
		bottom: bottom, closing: closing
	});
});

router.get('/test', (req, res) => {
	res.send(`
		${top('test')}
		${bottom}

		<script type="text/javascript">
			window.addEventListener('load', () => {
				Swal.fire({
					title: 'Please Enter Username',
					input: 'text',
					confirmButtonText: 'Look Up',
					showCancelButton: true,
					showLoadingOnConfirm: true,
					preConfirm: (username) => {
						if(username == 'enyeahgo') {
							return { status: 'success', message: 'Welcome Back!' }
						} else {
							return { status: 'error', message: 'You are not allowed! Contact server administrator.' }
						}
					},
					allowOutsideClick: () => !Swal.isLoading()
				}).then(result => {
					if(result.isConfirmed) {
						if(result.data.status == 'success') {
							Swal.fire({
								title: result.data.message,
								icon: 'success'
							});
						} else {
							Swal.fire({
								title: result.data.message,
								icon: 'error'
							});
						}
					}
				});
			});
		</script>

		${closing}
	`);
});

module.exports = router;
