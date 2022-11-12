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
				  title: 'Submit your Github username',
				  input: 'text',
				  inputAttributes: {
				    autocapitalize: 'off'
				  },
				  showCancelButton: true,
				  confirmButtonText: 'Look up',
				  showLoaderOnConfirm: true,
				  preConfirm: (login) => {
				    return fetch(`//api.github.com/users/${login}`)
				      .then(response => {
				        if (!response.ok) {
				          throw new Error(response.statusText)
				        }
				        return response.json()
				      })
				      .catch(error => {
				        Swal.showValidationMessage(
				          `Request failed: ${error}`
				        )
				      })
				  },
				  allowOutsideClick: () => !Swal.isLoading()
				}).then((result) => {
				  if (result.isConfirmed) {
				    Swal.fire({
				      title: `${result.value.login}'s avatar`,
				      imageUrl: result.value.avatar_url
				    })
				  }
				});
			});
		</script>
		${closing}
	`);
});

module.exports = router;
