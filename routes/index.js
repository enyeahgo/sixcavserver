var express = require('express');
var router = express.Router();
// Storage
var db = require('../storage');
var hierarchy = require('../hierarchy');
// Helpers
var top = require('../helpers/top');
var footer = require('../helpers/footer');
var bottom = require('../helpers/bottom');
var clientSocket = require('../helpers/clientSocket');
var swals = require('../helpers/swals');
var closing = require('../helpers/closing');
// Form Elements
var textInput = require('../helpers/formelements/textInput'), select = require('../helpers/formelements/select'), datePicker = require('../helpers/formelements/datePicker'), amountInput = require('../helpers/formelements/amountInput'), submitBtn = require('../helpers/formelements/submitBtn'), hidden = require('../helpers/formelements/hidden'), pwdInput = require('../helpers/formelements/pwdInput'), file = require('../helpers/formelements/file'), validateAndSend = require('../helpers/formelements/validateAndSend'), validateAndEdit = require('../helpers/formelements/validateAndEdit');

router.get('/', (req, res) => {
	res.send(`
		${top('Unit Activities Manager')}
		<div class="card shadow-sm">
			<div class="card-body p-0">
				<div class="list-group list-group-flush">
					<a href="/records/personnel" class="list-group-item list-group-item-action flex-column align-items-start">Personnel</a>
					<a href="/records/intelligence" class="list-group-item list-group-item-action flex-column align-items-start">Intelligence</a>
					<a href="/records/operations" class="list-group-item list-group-item-action flex-column align-items-start">Operations</a>
					<a href="/records/logistics" class="list-group-item list-group-item-action flex-column align-items-start">Logistics</a>
					<a href="/records/signal" class="list-group-item list-group-item-action flex-column align-items-start">Signal</a>
					<a href="/records/cmo" class="list-group-item list-group-item-action flex-column align-items-start">CMO</a>
					<a href="/records/training" class="list-group-item list-group-item-action flex-column align-items-start">Training</a>
					<a href="/records/finance" class="list-group-item list-group-item-action flex-column align-items-start">Finance</a>
					<a href="/records/atr" class="list-group-item list-group-item-action flex-column align-items-start">ATR</a>
				</div>
			</div>
		</div>
		${footer}
		${bottom}
		${swals}
		${closing}
	`);
});

router.get('/records/:staff', (req, res) => {
	res.send(`
		${top(req.params.staff+' Activities')}
		<div class="card shadow-sm mb-3">
			<div class="card-header bg-success text-light d-flex w-100 justify-content-between">
				<span>Records</span>
				<span>
				  <a href="/" class="btn btn-sm btn-primary outlined"><small>Home</small></a>
				  <a href="/newactivity/${req.params.staff}" class="btn btn-sm btn-primary outlined"><small>Add Record</small></a>
				</span>
			</div>
			<div class="card-body" id="data-container"></div>
		</div>
		<div id="pagination-container" class="d-flex justify-content-center"></div>
		${footer}
		${bottom}
		<script type="text/javascript">
			const socket = io();
			var pc = $('#pagination-container');

			window.addEventListener('load', () => {
				if(document.referrer.split('/')[3] != 'edit') {
					localStorage.setItem('currentPage', 1);
				}
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
								done(Object.values(response['${req.params.staff}']['storage']['activities']).sort((a, b) => parseInt(a.data.unix)-parseInt(b.data.unix)));
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
				var html = '<div class="list-group list-group-flush">';
				data.forEach(d => {
					html += '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">'+d.data.activity+'</h5><small>₱'+moneyfy(d.data.amount)+'</small></div><p class="sm mb-1">Major Program: '+d.data.mptitle+'</p><p class="sm mb-1">Sub-Program: '+d.data.sptitle+'</p><p class="sm mb-3">Specific: '+d.data.sp_title+'</p><p class="mb-1">Date Conducted: '+(new Date(d.data.date)).toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric"})+'</p><small>'+d.data.quarter.toUpperCase()+' QUARTER '+d.data.year+'</small><p class="sm mt-2">APB-Based: '+d.data.apbBased.toUpperCase()+'&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;AAR: '+d.data.hasAar.toUpperCase()+'&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;FUR: '+d.data.hasFur.toUpperCase()+'</p></a>';
				});
				html += '</div>';
				return html;
			}
		</script>
		${closing}
	`);
});

router.get('/newactivity/:id', (req, res) => {
	let staff = req.params.id;
	let paps = Object.values(hierarchy.all());
	let mps = [];
	paps.map(mp => {
		mps.push(`${mp.id}-${mp.title}`);
	});
	res.send(`
		${top(staff)}
		<div class="card shadow-sm">
			<div class="card-header bg-success text-light d-flex w-100 justify-content-between">
				<span>Add New Record</span>
				<span><a href="/records/${staff}" class="btn btn-sm btn-secondary outlined"><small>View Records</small></a></span>
			</div>
			<div class="card-body">
				${hidden('staff', staff)}
				${hidden('type', 'activities')}
				${select('mp', '', 'PA Major Program (4L)', mps)}
				<div class="form-group mt-3" id="spContainer" style="display: none;">
					<select class="form-control" id="sp" name="sp"></select>
					<small class="form-text text-muted">Sub-Program (5L)</small>
				</div>
				<div class="form-group mt-3" id="spContainer_" style="display: none;">
					<select class="form-control" id="sp_" name="sp_"></select>
					<small class="form-text text-muted">Suggested Program (6L)</small>
				</div>
				<div class="form-group mt-3" id="activityContainer" style="display: none;">
					<div class="input-group">
						<div class="input-group-prepend">
							<span class="input-group-text">Other</span>
						</div>
						<input type="text" class="form-control" id="activity" name="activity" placeholder="Type activity here..." />
					</div>
					<small class="form-text text-muted">The title of the activity</small>
				</div>
				<div class="form-group mt-3" id="specifyContainer" style="display: none;">
					<div class="input-group">
						<div class="input-group-prepend">
							<span class="input-group-text">Specify</span>
						</div>
						<input type="text" class="form-control" id="specify" name="specify" placeholder="Specify title of activity here..." />
					</div>
					<small class="form-text text-muted">Type the specific title of the activity</small>
				</div>
				<div class="row mt-3 mb-3">
					<div class="form-group col-6">
						<div class="input-group">
							<div class="input-group-prepend">
								<span class="input-group-text">Date</span>
							</div>
							<input type="date" class="form-control" id="date" name="date" />
						</div>
						<small class="form-text text-muted">Date when the activity was conducted</small>
					</div>
					<div class="form-group col-6">
						<select class="form-control" id="apbBased" name="apbBased">
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>
						<small class="form-text text-muted">APB-based activity?</small>
					</div>
				</div>
				<div class="row mt-3 mb-3">
					<div class="form-group col-6">
						<select class="form-control" id="year" name="year">
							<option selected disabled>Choose Year</option>
							<option value="2021">2021</option>
							<option value="2022">2022</option>
						</select>
						<small class="form-text text-muted">What year?</small>
					</div>
					<div class="form-group col-6">
						<select class="form-control" id="quarter" name="quarter">
							<option selected disabled>Choose Quarter</option>
							<option value="first">First</option>
							<option value="second">Second</option>
							<option value="third">Third</option>
							<option value="fourth">Fourth</option>
						</select>
						<small class="form-text text-muted">What quarter?</small>
					</div>
				</div>
				<div class="row mt-3 mb-3">
					<div class="form-group col-4">
						<select class="form-control" id="hasAar" name="hasAar">
						<option value="no">No</option>
							<option value="yes">Yes</option>
						</select>
						<small class="form-text text-muted">Has AAR?</small>
					</div>
					<div class="form-group col-4" id="hasFurContainer" style="display: none;">
						<select class="form-control" id="hasFur" name="hasFur">
						<option value="no">No</option>
							<option value="yes">Yes</option>
						</select>
						<small class="form-text text-muted">Has FUR?</small>
					</div>
					<div class="form-group col-4" id="amountContainer" style="display: none;">
						<div class="input-group">
							<div class="input-group-prepend">
								<span class="input-group-text">₱</span>
							</div>
							<input type="number" class="form-control" id="amount" name="amount" />
						</div>
						<small class="form-text text-muted">Cost on FUR</small>
					</div>
				</div>
				${submitBtn('saveBtn', 'Submit')}
			</div>
		</div>
		${footer}
		${bottom}
		<script type="text/javascript">
			$('#mp').on('change', () => {
				$.ajax({
					type: 'GET', url: '/mp/'+document.getElementById('mp').value,
					success: response => {
						document.getElementById('sp').innerHTML = response;
						document.getElementById('spContainer').style.display = 'block';
						document.getElementById('sp_').value = '';
						document.getElementById('spContainer_').style.display = 'none';
					}
				});
			});
			$('#sp').on('change', () => {
				$.ajax({
					type: 'GET', url: '/sp/'+document.getElementById('mp').value+'/'+document.getElementById('sp').value,
					success: response => {
						document.getElementById('sp_').innerHTML = response;
						document.getElementById('spContainer_').style.display = 'block';
					}
				});
			});
			$('#sp_').on('change', () => {
				if(document.getElementById('sp_').value == 'other') {
					document.getElementById('activityContainer').style.display = 'block';
					document.getElementById('specify').value = '';
					document.getElementById('specifyContainer').style.display = 'none';
				} else {
					document.getElementById('activity').value = '';
					document.getElementById('activityContainer').style.display = 'none';
					document.getElementById('specifyContainer').style.display = 'block';
				}
			});
			$('#hasAar').on('change', () => {
				if(document.getElementById('hasAar').value == 'yes') {
					document.getElementById('hasFurContainer').style.display = 'block';
				} else {
					document.getElementById('hasFur').value = 'no';
					document.getElementById('hasFurContainer').style.display = 'none';
				}
			});
			$('#hasFur').on('change', () => {
				if(document.getElementById('hasFur').value == 'yes') {
					document.getElementById('amountContainer').style.display = 'block';
				} else {
					document.getElementById('amount').value = '0';
					document.getElementById('amountContainer').style.display = 'none';
				}
			});
			$('#activity').on('change', () => {
				document.getElementById('specify').value = document.getElementById('activity').value;
			});
			$('#specify').on('change', () => {
				document.getElementById('activity').value = document.getElementById('specify').value;
			});
		</script>
		${validateAndSend('/newactivity', 'saveBtn', ['staff', 'type', 's-mp', 's-sp', 's-sp_', 'activity', 'date', 's-year', 's-quarter', 'amount'], staff)}
		${swals}
		${closing}
	`);
});

router.post('/newactivity', (req, res) => {
	let result = addToDb(req.body.staff, req.body.type, req.body);
	res.status(200).send(result.message);
});

router.get('/edit/:staff/:id', (req, res) => {
	let data = db.get(req.params.staff).storage.activities[req.params.id].data;
	console.log(data);
	res.send(`
		${top(req.params.staff)}
		<div class="card shadow-sm">
			<div class="card-header bg-success text-light d-flex w-100 justify-content-between">
				<span>Edit Record</span>
				<span><a href="/records/${req.params.staff}" class="btn btn-sm btn-secondary outlined"><small>Back</small></a></span>
			</div>
			<div class="card-body">
				${hidden('staff', req.params.staff)}
				${hidden('type', 'activities')}
				${hidden('id', req.params.id)}
				${textInput('activity', data.activity, 'The activity name.')}
				${datePicker('finishDate', data.finishDate, 'Finish Date', 'The date that the activity finished.')}
				${select('year', data.year, 'Choose what year is this activity', ['2021-2021', '2022-2022'])}
				${select('quarter', data.quarter, 'Choose what quarter is this activity', ['first-First Quarter', 'second-Second Quarter', 'third-Third Quarter', 'fourth-Fourth Quarter'])}
				${amountInput('amount', data.amount, 'The amount of the activity.')}
				${submitBtn('saveBtn', 'Submit Edit')}
			</div>
		</div>
		${bottom}
		${validateAndEdit('/editactivity', 'saveBtn', ['staff', 'type', 'id', 'activity', 'finishDate', 's-year', 's-quarter', 'amount'], req.params.staff)}
		${swals}
		${closing}
	`);
});

router.post('/editactivity', (req, res) => {
	let storage = db.get(req.body.staff).storage;
	let activities = storage.activities;
	req.body.createdAt = (new Date).getTime();
	req.body.unix = (new Date(req.body.finishDate)).getTime();
	activities[req.body.id] = { id: req.body.id, data: req.body };
	storage.activities = activities;
	db.put({id: req.body.staff, storage: storage});
	res.status(200).send('Item successfully edited!');
});

router.get('/mp/:id', (req, res) => {
	let mp = Object.values(hierarchy.get(req.params.id).types);
	let sps = '';
	mp.map(sp => {
		sps += `<option value="${sp.id}">${sp.title}</option>`;
	});
	res.send(`
		<option selected disabled>Choose Sub-Program (5L)</option>
		${sps}
	`);
});

router.get('/sp/:mp/:id', (req, res) => {
	let mp = Object.values(hierarchy.get(req.params.mp).types[req.params.id].types);
	let sps = '';
	mp.map(sp => {
		sps += `<option value="${sp.id}">${sp.title}</option>`;
	});
	res.send(`
		<option selected disabled>Choose Suggested Program (6L)</option>
		${sps}
		<option value="other">Other</option>
	`);
});

// FUNCTIONS
function randomString() {
	return `${Math.random().toString(36).replace(/[^a-z]+/g, '')}${Math.random().toString(36).replace(/[^a-z]+/g, '')}`.substring(0,6);
}
function addToDb(id, addTo, data) {
	let h = hierarchy.all();
	let node = db.get(id);
	let storage = {};
	let newEntry = randomString();
	let dataHolder = {};
	if(node != null) {
		data.createdAt = (new Date).getTime();
		data.mptitle = h[data.mp].title;
		data.sptitle = h[data.mp].types[data.sp].title;
		if(data.sp_ == 'other') {
			data.sp_title = 'Other';
		} else {
			data.sp_title = h[data.mp].types[data.sp].types[data.sp_].title;
		}
		storage = node.storage;
		// For New Activities
		if(storage[addTo] == null || storage[addTo] == undefined) {
			dataHolder[newEntry]['id'] = newEntry;
			data.unix = (new Date(data.date)).getTime();
			dataHolder[newEntry]['data'] = data;
			storage[addTo] = dataHolder;
			db.put({ id: id, storage: storage });
			return { status: 'success', message: `Database entry successfully recorded with id: ${newEntry}` };
		// Already have Activities on storage
		} else {
			dataHolder = storage[addTo];
			dataHolder[newEntry] = {};
			dataHolder[newEntry]['id'] = newEntry;
			data.unix = (new Date(data.date)).getTime();
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
