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
var textInput = require('../helpers/formelements/textInput'), select = require('../helpers/formelements/select'), datePicker = require('../helpers/formelements/datePicker'), amountInput = require('../helpers/formelements/amountInput'), submitBtn = require('../helpers/formelements/submitBtn'), hidden = require('../helpers/formelements/hidden'), pwdInput = require('../helpers/formelements/pwdInput');file = require('../helpers/formelements/file'), validateAndSend = require('../helpers/formelements/validateAndSend'), validateAndEdit = require('../helpers/formelements/validateAndEdit');

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
	let staff = req.params.id;
	res.send(`
		${top(staff)}
		<div class="card shadow-sm">
			<div class="card-header bg-success text-light">Add New Record</div>
			<div class="card-body">
				${hidden('staff', staff)}
				${hidden('type', 'activities')}
				${textInput('activity', 'The activity name.')}
				${datePicker('finishDate', 'Finish Date', 'The date that the activity finished.')}
				${select('quarter', 'Choose what quarter is this activity', {
					first: 'First Quarter', second: 'Second Quarter', third: 'Third Quarter', fourth: 'Fourth Quarter'
				})}
				${amountInput('amount', 'The amount of the activity.')}
				${submitBtn('saveBtn', 'Submit')}
			</div>
		</div>
		${bottom}
		${validateAndSend('/newactivity', 'saveBtn', ['staff', 'type', 'activity', 'finishDate', 's-quarter', 'amount'], staff)}
		${swals}
		${closing}
	`);
});

router.post('/newactivity', (req, res) => {
	let result = addToDb(req.body.staff, req.body.type, req.body);
	res.status(200).send(result.message);
});

router.get('/records/:staff', (req, res) => {
	res.send(`
		${top(req.params.staff+' Records')}
		<div class="card shadow-sm mb-3">
			<div class="card-header bg-success text-light">Records</div>
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
					html += '<li class="list-group-item d-flex justify-content-between align-items-center">' + d.data.activity + '<span>' + d.id + '</span><span>'+d.data.amount+'</span></li>'
				});
				html += '</ul>';
				return html;
			}
		</script>
		${closing}
	`);
});

router.get('/edit/:staff/:id', (req, res) => {
	let data = db.get(req.params.staff).storage.activities[req.params.id].data;
	console.log(data);
	res.send(`
		${top(req.params.staff)}
		<div class="card shadow-sm">
			<div class="card-header bg-success text-light">Add New Record</div>
			<div class="card-body">
				${hidden('staff', req.params.staff)}
				${hidden('type', 'activities')}
				${hidden('id', req.params.id)}
				${textInput('activity', data.activity, 'The activity name.')}
				${datePicker('finishDate', data.finishDate, 'Finish Date', 'The date that the activity finished.')}
				${select('quarter', data.quarter, 'Choose what quarter is this activity', {
					first: 'First Quarter', second: 'Second Quarter', third: 'Third Quarter', fourth: 'Fourth Quarter'
				})}
				${amountInput('amount', data.amount, 'The amount of the activity.')}
				${submitBtn('saveBtn', 'Submit Edit')}
			</div>
		</div>
		${bottom}
		${validateAndEdit('/editactivity', 'saveBtn', ['staff', 'type', 'id', 'activity', 'finishDate', 's-quarter', 'amount'], req.params.staff)}
		${swals}
		${closing}
	`);
});

router.post('/editactivity', (req, res) => {
	let storage = db.get(req.body.staff).storage;
	let activities = storage.activities;
	activities[req.body.id] = { id: req.body.id, data: req.body };
	storage.activities = activities;
	db.put({id: req.body.staff, storage: storage});
	res.status(200).send('Item successfully edited!');
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
		data.createdAt = (new Date).getTime();
		storage = node.storage;
		if(storage[addTo] == null || storage[addTo] == undefined) {
			dataHolder[newEntry]['id'] = newEntry;
			dataHolder[newEntry]['data'] = data;
			storage[addTo] = dataHolder;
			db.put({ id: id, storage: storage });
			return { status: 'success', message: `Database entry successfully recorded with id: ${newEntry}` };
		} else {
			dataHolder = storage[addTo];
			dataHolder[newEntry] = {};
			dataHolder[newEntry]['id'] = newEntry;
			dataHolder[newEntry]['data'] = data;
			storage[addTo] = dataHolder;
			db.put({ id: id, storage: storage });
			return { status: 'success', message: `Database entry successfully recorded with id: ${newEntry}` };
		}
	} else {
		db.put({ id: id, storage: {} });
		addToDb(id, addTo, data);
	}
}

module.exports = router;
