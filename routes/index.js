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
var textInput = require('../helpers/formelements/textInput'), select = require('../helpers/formelements/select'), datePicker = require('../helpers/formelements/datePicker'), amountInput = require('../helpers/formelements/amountInput'), submitBtn = require('../helpers/formelements/submitBtn'), hidden = require('../helpers/formelements/hidden'), pwdInput = require('../helpers/formelements/pwdInput');file = require('../helpers/formelements/file'),validate = require('../helpers/formelements/validate');

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
			  if(document.getElementById('chat').value == '') {
			    toast('Chat must not be empty!', 'error');
			  } else {
				  socket.emit('chat', document.getElementById('chat').value);
				  toast('Chat sent!', 'success');
			  }
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
			const socket = io();
			window.addEventListener('load', () => {
				socket.emit('dbchanged', '${req.params.id}');
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

router.get('/records/:staff', (req, res) => {
	res.send(`
		${top('pagination')}
		<div class="card shadow-sm mb-3">
			<div class="card-header bg-success text-light">Pagination</div>
			<div class="card-body" id="data-container"></div>
		</div>
		<div id="pagination-container" class="d-flex justify-content-center"></div>
		${bottom}
		<script type="text/javascript">
			const socket = io();
			var pc = $('#pagination-container');

			window.addEventListener('load', () => {
				localStorage.setItem('currentPage', 1);
				updateData(true);
			});

			socket.on('dbchanged', staff => {
				console.log(staff);
				if(staff == '${req.params.staff}') {
					updateData(false);
				}
			});

			function updateData() {
				pc.pagination({
					className: 'paginationjs-theme-blue',
					dataSource: function(done) {
						$.ajax({
							type: 'GET', url: '/storage/serverstorage.json',
							success: response => {
								console.log(response['${req.params.staff}']['storage']['activities']);
								done(Object.values(response['${req.params.staff}']['storage']['activities']));
							}
						});
					},
					pageSize: 3,
					pageNumber: localStorage.getItem('currentPage'),
					callback: (data, pagination) => {
						var html = template(data);
						$('#data-container').html(html);
					}
				});
				pc.addHook('afterPreviousOnClick', function() {
					console.log('page btn clicked! '+pc.pagination('getSelectedPageNum'));
					localStorage.setItem('currentPage', parseInt(pc.pagination('getSelectedPageNum')));
				});
				pc.addHook('afterPageOnClick', function() {
					console.log('page btn clicked! '+pc.pagination('getSelectedPageNum'));
					localStorage.setItem('currentPage', parseInt(pc.pagination('getSelectedPageNum')));
				});
				pc.addHook('afterNextOnClick', function() {
					console.log('page btn clicked! '+pc.pagination('getSelectedPageNum'));
					localStorage.setItem('currentPage', parseInt(pc.pagination('getSelectedPageNum')));
				});
			}

			function template(data) {
				var html = '<ul class="list-group list-group-flush">';
				data.forEach(d => {
					html += '<li class="list-group-item d-flex justify-content-between align-items-center">' + d.activity + '<span>' + d.amount + '</span></li>'
				});
				html += '</ul>';
				return html;
			}
		</script>
		${closing}
	`);
});

router.get('/n', (req, res) => {
	let result = '';
	for(let i = 1; i < 100; i++) {
		result += `${i}, `
	}
	res.send(result);
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
