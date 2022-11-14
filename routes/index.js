var express = require('express');
var router = express.Router();

// Helpers
var db = require('../storage');
var top = require('../helpers/top');
var bottom = require('../helpers/bottom');
var clientSocket = require('../helpers/clientSocket');
var swals = require('../helpers/swals');
var closing = require('../helpers/closing');

// Form Elements
var textInput = require('../helpers/formelements/textInput');
var select = require('../helpers/formelements/select');
var datePicker = require('../helpers/formelements/datePicker');
var amountInput = require('../helpers/formelements/amountInput');
var submitBtn = require('../helpers/formelements/submitBtn');
var hidden = require('../helpers/formelements/hidden');
var pwdInput = require('../helpers/formelements/pwdInput');
var file = require('../helpers/formelements/file');
var validate = require('../helpers/formelements/validate');

router.get('/', (req, res) => {
	res.send(`
		${top('6Cav Server')}
		${textInput('chat', 'Type your message here.')}
		<button class="btn btn-lg btn-primary" onclick="sendChat()">Send</button>
		<br><br>
		<div id="brdcst">Nothing here yet...</div>
		${bottom}
		<script type="text/javascript">
			const socket = io();
			function sendChat() {
				socket.emit('chat', document.getElementById('chat').value);
				toast('Chat sent!', 'success');
			}
			socket.on('broadcast', msg => {
				console.log(msg);
				document.getElementById('brdcst').innerText = msg;
			});
		</script>
		${swals}
		${closing}
	`);
});

router.get('/newactivity/:id', (req, res) => {
	let user = req.params.id;
	res.send(`
		${top(user)}
		<div class="card shadow-sm">
			<div class="card-header bg-success text-light">Add New Record</div>
			<div class="card-body">
				<form method="post" action="/newrecord" id="newrecordform">
					${hidden('staff', user)}
					${hidden('type', 'activities')}
					${textInput('activity', 'The activity name.')}
					${datePicker('finishDate', 'Finish Date', 'The date that the activity finished.')}
					${select('quarter', 'Choose what quarter is this activity', {
						first: 'First Quarter', second: 'Second Quarter', third: 'Third Quarter', fourth: 'Fourth Quarter'
					})}
					${amountInput('amount', 'The amount of the activity.')}
				</form>
				${submitBtn('saveBtn', 'Submit')}
			</div>
		</div>
		${bottom}
		${validate('newrecordform', 'saveBtn', ['activity', 'finishDate', 's-quarter', 'amount'])}
		${closing}
	`);
});

router.get('/newactivity_/:id', (req, res) => {
	let user = req.params.id;
	res.send(`
		${top(user)}
		<div class="card shadow-sm">
			<div class="card-header bg-success text-light">Add New Record</div>
			<div class="card-body">
				<form method="post" action="/newrecord" id="newrecordform">
					${hidden('staff', user)}
					${hidden('type', 'activities')}
					${textInput('activity', 'The activity name.')}
					${datePicker('finishDate', 'Finish Date', 'The date that the activity finished.')}
					${select('quarter', 'Choose what quarter is this activity', {
						first: 'First Quarter', second: 'Second Quarter', third: 'Third Quarter', fourth: 'Fourth Quarter'
					})}
					${amountInput('amount', 'The amount of the activity.')}
				</form>
				${submitBtn('saveBtn', 'Submit')}
			</div>
		</div>
		${bottom}
		<script type="text/javascript">
			window.addEventListener('load', () => {
				Swal.fire('Success', 'Activity successfully recorded! Thank you.', 'success');
			});
		</script>
		${validate('newrecordform', 'saveBtn', ['activity', 'finishDate', 's-quarter', 'amount'])}
		${closing}
	`);
});

router.post('/newrecord', (req, res) => {
	let id = req.body.staff;
	let addTo = req.body.type;
	let result = addToDb(id, addTo, req.body);
	res.redirect(`/newactivity_/${id}`);
});

router.get('/getactivities/:id', (req, res) => {
	let activities = Object.values(db.get(req.params.id).storage.activities);
	let result = '';
	activities.map(a => {
		result += `<li>${a.id} - ${a.activity} - ${a.amount}</li>`
	});
	let pagination = '';
	if(activities.length > 10) {
		pagination = `
			<nav aria-label="Page navigation example">
				<ul class="pagination justify-content-center">
					<li class="page-item" id="prevBtn">
						<a class="page-link" href="#" tabindex="-1">Previous</a>
					</li>
					<li class="page-item active"><a class="page-link" href="#">1</a></li>
					<li class="page-item"><a class="page-link" href="#">2</a></li>
					<li class="page-item"><a class="page-link" href="#">3</a></li>
					<li class="page-item" id="nextBtn">
						<a class="page-link" href="#">Next</a>
					</li>
				</ul>
			</nav>
		`;
	}
	res.send(`
		${top(`${req.params.id} Activities`)}
		<ul>${result}</ul>
		${pagination}
		${bottom}
		${closing}
	`);
});

// FUNCTIONS
function randomString() {
	return `${Math.random().toString(36).replace(/[^a-z]+/g, '')}${Math.random().toString(36).replace(/[^a-z]+/g, '')}`.substring(0,6);
}

function addToDb(id, addTo, data) {
	let node = db.get(id);
	let storage = {};
	let newEntry = randomString();
	let dataHolder = {};
	if(node != null) {
		data.id = newEntry;
		storage = node.storage;
		if(storage[addTo] == null || storage[addTo] == undefined) {
			dataHolder[newEntry] = data;
			storage[addTo] = dataHolder;
			db.put({ id: id, storage: storage });
			return newEntry;
		} else {
			dataHolder = storage[addTo];
			dataHolder[newEntry] = data;
			storage[addTo] = dataHolder;
			db.put({ id: id, storage: storage });
			return newEntry;
		}
	} else {
		db.put({ id: id, storage: "" });
		addToDb(id, addTo, data);
	}
}

module.exports = router;
