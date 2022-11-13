var express = require('express');
var router = express.Router();
var db = require('../storage');
var top = require('../helpers/top');
var bottom = require('../helpers/bottom');
var closing = require('../helpers/closing');

router.get('/', (req, res) => {
	res.send(`
		${top('6Cav Server')}
		${bottom}
		<script>
			window.addEventListener('load', () => {
				Swal.fire('Hello', 'Welcome to 6Cav Server', 'success');
			});
		</script>
		${closing}
	`);
});

router.get('/new/:id', (req, res) => {
	let user = req.params.id;
	res.send(`
		${top('New Record')}

		<div class="card shadow-sm">
			<div class="card-header bg-success text-light">Add New Record</div>
			<div class="card-body">
				<div class="card-title text-center bold">${user.toUpperCase()}</div>

			</div>
		</div>

		${bottom}
		${closing}
	`);
});

router.get('/teststorage/:id', (req, res) => {
	let result = db.get(req.params.id);
	res.send(result);
});

router.get('/addrecord/:id', (req, res) => {
	// Get old storage
	let oldStorage = db.get(req.params.id).storage.activities;
	// Insert new entry
	let newEntry = randomString();
	oldStorage[newEntry] = {
		id: newEntry, title: 'XXX', activity: 'YYY'
	};
	db.put({
		id: req.params.id,
		storage: {activities: oldStorage}
	});
	res.send(newEntry);
});

router.get('/getactivities/:id', (req, res) => {
	let activities = Object.values(db.get(req.params.id).storage.activities);
	let result = '';
	activities.map(a => {
		result += `<li>${a.id} - ${a.title} - ${a.activity}</li>`
	});
	res.send(`
		${top(`${req.params.id} Activities`)}
		<ul>${result}</ul>
		${bottom}
		${closing}
	`);
});

// FUNCTIONS
function randomString() {
	return `${Math.random().toString(36).replace(/[^a-z]+/g, '')}${Math.random().toString(36).replace(/[^a-z]+/g, '')}`.substring(0,6);
}

module.exports = router;
