var express = require('express');
var router = express.Router();
// Storage
var codb = require('../co'), exodb = require('../exo'), fsgtdb = require('../fsgt'), persdb = require('../pers'), inteldb = require('../intel'), opsdb = require('../ops'), logdb = require('../log'), sigdb = require('../sig'), cmodb = require('../cmo'), trgdb = require('../trg'), findb = require('../fin'), atrdb = require('../atr'); 
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
		${top('Unit Activity Manager')}
		<div class="card shadow-sm">
			<div class="card-body p-0">
				<div class="list-group list-group-flush menuTitle">
					<a href="/records/co" class="list-group-item list-group-item-action flex-column align-items-start">CO</a>
					<a href="/records/exo" class="list-group-item list-group-item-action flex-column align-items-start">EXO</a>
					<a href="/records/fsgt" class="list-group-item list-group-item-action flex-column align-items-start">FSgt</a>
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
		${footer('block')}
		${bottom}
		${swals}
		${closing}
	`);
});

router.get('/records/:staff', (req, res) => {
	let sid = staffid(req.params.staff);
	res.send(`
		${top(req.params.staff+' Activities')}
		<div class="card shadow-sm mb-3" id="recordscard" style="display: none;">
			<div class="card-header bg-success text-light d-flex w-100 justify-content-between">
				<span>Records</span>
				<span>
				  <a href="/" class="btn btn-sm btn-primary outlined"><small>Home</small></a>
				  <a href="/newactivity/${req.params.staff}" class="btn btn-sm btn-primary outlined"><small>Add Record</small></a>
				</span>
			</div>
			<div class="card-body p-0" id="data-container"></div>
		</div>
		<div id="pagination-container" class="d-flex justify-content-center"></div>
		${footer('none')}
		${bottom}
		<script type="text/javascript">
			const socket = io();
			var pc = $('#pagination-container');

			window.addEventListener('DOMContentLoaded', () => {
				if(document.referrer.split('/')[3] == 'edit') {
					toast('Database edit success!', 'success');
				} else if(document.referrer.split('/')[3] == 'deleteactivity') {
					toast('Database edit success!', 'success');
				} else {
					localStorage.setItem('currentPage', 1);
				}

				if(document.location.pathname.split('/').pop() == 'co') {
					Swal.fire({
						title: 'Enter PIN',
						input: 'password'
					}).then(result => {
						toast('Unauthorized', 'error');
					});
				} else {
					document.getElementById('recordscard').style.display = 'block';
					document.getElementById('footer').style.display = 'block';
					updateData(true);
				}
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
							type: 'GET', url: '/storage/${sid}.json',
							success: response => {
								if(response != null || response != undefined || response != {}) {
									done(Object.values(response).sort((a, b) => parseInt(a.data.unix)-parseInt(b.data.unix)));
								} else {
									done([]);
								}
							}
						});
					},
					pageSize: 3,
					pageNumber: localStorage.getItem('currentPage'),
					autoHidePrevious: true,
    			autoHideNext: true,
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
					html += '<a href="/edit/${req.params.staff}/'+d.id+'" class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">'+d.data.activity+'</h5><small>₱'+moneyfy(d.data.amount)+'</small></div><p class="sm mb-1">Major Program: '+d.data.mptitle+'</p><p class="sm mb-1">Sub-Program: '+d.data.sptitle+'</p><p class="sm mb-3">Specific: '+d.data.sp_title+'</p><p class="mb-1">Date Conducted: '+(new Date(d.data.date)).toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric"})+'</p><small>'+d.data.quarter.toUpperCase()+' QUARTER '+d.data.year+'</small><p class="sm mt-2">APB-Based: '+d.data.apbBased.toUpperCase()+'&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;AAR: '+d.data.hasAar.toUpperCase()+'&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;FUR: '+d.data.hasFur.toUpperCase()+'</p></a>';
				});
				html += '</div>';
				return html;
			}
		</script>
		${swals}
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
				<span><a href="/records/${staff}" class="btn btn-sm btn-secondary outlined"><small>Back</small></a></span>
			</div>
			<div class="card-body">
				${hidden('staff', staff)}
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
		${footer('block')}
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
		${validateAndSend('/newactivity', 'saveBtn', ['staff', 's-mp', 's-sp', 's-sp_', 'activity', 'date', 's-year', 's-quarter', 'amount'], staff)}
		${swals}
		${closing}
	`);
});

router.post('/newactivity', (req, res) => {
	let result = addToDb(req.body.staff, req.body);
	res.status(200).send(result.message);
});

router.get('/edit/:staff/:id', (req, res) => {
	let staff = req.params.staff;
	let id = req.params.id;
	let data = getOne(staff, id).data;
	console.log(data);

	let h = hierarchy.all();
	let paps = Object.values(h);
	let mps = [];
	paps.map(mp => {
		mps.push(`${mp.id}-${mp.title}`);
	});

	let hh = h[data.mp].types;
	let spsNode = Object.values(hh);
	let sps = [];
	spsNode.map(sp => {
		sps.push(`${sp.id}-${sp.title}`);
	});

	let hhh = hh[data.sp].types;
	let spsNode_ = Object.values(hhh);
	let sps_ = [];
	spsNode_.map(sp_ => {
		sps_.push(`${sp_.id}-${sp_.title}`);
	});
	sps_.push(`other-Other`);

	res.send(`
		${top(`Edit Record - ${id}`)}
		<div class="card shadow-sm">
			<div class="card-header bg-success text-light d-flex w-100 justify-content-between">
				<span>Edit Record</span>
				<span>
					<a href="/records/${staff}" class="btn btn-sm btn-secondary outlined"><small>Back</small></a>
					<button class="btn btn-sm btn-danger outlined" onclick="deleteActivity('${staff}', '${id}');"><small>Delete Record</small></button>
				</span>
			</div>
			<div class="card-body">
				${hidden('staff', staff)}
				${hidden('type', 'activities')}
				${hidden('id', id)}
				<div class="mb-3">
					${select('mp', data.mp, 'PA Major Program (4L)', mps)}
				</div>
				<div class="mb-3" id="spContainer">
					${select('sp', data.sp, 'Sub-Program (5L)', sps)}
				</div>
				<div class="mb-3" id="spContainer_">
					${select('sp_', data.sp_, 'Suggested Program (6L)', sps_)}
				</div>
				<div class="form-group mt-3" id="activityContainer">
					<div class="input-group">
						<div class="input-group-prepend">
							<span class="input-group-text">Other</span>
						</div>
						<input type="text" class="form-control" id="activity" name="activity" placeholder="Type activity here..." value="${data.activity}" />
					</div>
					<small class="form-text text-muted">The title of the activity</small>
				</div>
				<div class="form-group mt-3" id="specifyContainer" style="display: none;">
					<div class="input-group">
						<div class="input-group-prepend">
							<span class="input-group-text">Specify</span>
						</div>
						<input type="text" class="form-control" id="specify" name="specify" placeholder="Specify title of activity here..." value="${data.activity}" />
					</div>
					<small class="form-text text-muted">Type the specific title of the activity</small>
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
				${submitBtn('saveBtn', 'Save')}
			</div>
		</div>
		${footer('block')}
		${bottom}
		<script type="text/javascript">
			window.addEventListener('load', () => {
				document.getElementById('year').value = '${data.year}';
				document.getElementById('quarter').value = '${data.quarter}';
				document.getElementById('date').value = '${data.date}';
				document.getElementById('apbBased').value = '${data.apbBased}';
				document.getElementById('hasAar').value = '${data.hasAar}';
				if('${data.hasAar}' == 'yes') {
					document.getElementById('hasFur').value = '${data.hasFur}';
					document.getElementById('hasFurContainer').style.display = 'block';
					if('${data.hasFur}' == 'yes') {
						document.getElementById('amount').value = '${data.amount}';
						document.getElementById('amountContainer').style.display = 'block';
					} else {
						document.getElementById('amount').value = 0;
						document.getElementById('amountContainer').style.display = 'none';
					}
				} else {
					document.getElementById('hasFur').value = '${data.hasFur}';
					document.getElementById('hasFurContainer').style.display = 'none';
				}
			});

			function deleteActivity(staff, id) {
				Swal.fire({
					title: 'Are you sure you want to delete this record?',
					showCancelButton: true,
					showConfirmButton: true,
					cancelButtonText: 'Cancel',
					confirmButtonText: 'Delete',
					confirmButtonColor: 'red',
					focusConfirm: false,
					allowOutsideClick: false,
				}).then(result => {
					if(result.isConfirmed) {
						location.href = '/deleteactivity/'+staff+'/'+id;
					}
				});
			}

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
		${validateAndEdit('/editactivity', 'saveBtn', ['staff', 'id', 'type', 's-mp', 's-sp', 's-sp_', 'activity', 'date', 's-year', 's-quarter'], staff)}
		${swals}
		${closing}
	`);
});

router.post('/editactivity', (req, res) => {
	let h = hierarchy.all();
	// Prepare req.body
	req.body.createdAt = (new Date).getTime();
	req.body.unix = (new Date(req.body.date)).getTime();
	req.body.mptitle = h[req.body.mp].title;
	req.body.sptitle = h[req.body.mp].types[req.body.sp].title;
	if(req.body.sp_ == 'other') {
		req.body.sp_title = 'Other';
	} else {
		req.body.sp_title = h[req.body.mp].types[req.body.sp].types[req.body.sp_].title;
	}

	putDb(req.body.staff, req.body.id, req.body);
	res.status(200).send('Item successfully edited!');
});

router.get('/deleteactivity/:staff/:id', (req, res) => {
	delOne(req.params.staff, req.params.id);
	res.redirect(`/records/${req.params.staff}`);
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
function addToDb(staff, newdata) {
	// Init
	let h = hierarchy.all();
	let newEntry = randomString();
	// Finalize data
	newdata.createdAt = (new Date).getTime();
	newdata.unix = (new Date(newdata.date)).getTime();
	newdata.mptitle = h[newdata.mp].title;
	newdata.sptitle = h[newdata.mp].types[newdata.sp].title;
	if(newdata.sp_ == 'other') {
		newdata.sp_title = 'Other';
	} else {
		newdata.sp_title = h[newdata.mp].types[newdata.sp].types[newdata.sp_].title;
	}
	// Save
	putDb(staff, newEntry, newdata);
	return { status: 'success', message: `Database entry successfully recorded with id: ${newEntry}` };
}
function staffid(staff) {
	switch(staff) {
		case 'co': { return 'co'; break; }
		case 'exo': { return 'exo'; break; }
		case 'fsgt': { return 'fsgt'; break; }
		case 'personnel': { return 'pers'; break; }
		case 'intelligence': { return 'intel'; break; }
		case 'operations': { return 'ops'; break; }
		case 'logistics': { return 'log'; break; }
		case 'signal': { return 'sig'; break; }
		case 'cmo': { return 'cmo'; break; }
		case 'training': { return 'trg'; break; }
		case 'finance': { return 'fin'; break; }
		case 'atr': { return 'atr'; break; }
	}
}
function getAll(staff) {
	switch(staff) {
		case 'co': { return codb.all(); break; }
		case 'exo': { return exodb.all(); break; }
		case 'fsgt': { return fsgtdb.all(); break; }
		case 'personnel': { return persdb.all(); break; }
		case 'intelligence': { return inteldb.all(); break; }
		case 'operations': { return opsdb.all(); break; }
		case 'logistics': { return logdb.all(); break; }
		case 'signal': { return sigdb.all(); break; }
		case 'cmo': { return cmodb.all(); break; }
		case 'training': { return trgdb.all(); break; }
		case 'finance': { return findb.all(); break; }
		case 'atr': { return atrdb.all(); break; }
	}
}
function getOne(staff, id) {
	switch(staff) {
		case 'co': { return codb.get(id); break; }
		case 'exo': { return exodb.get(id); break; }
		case 'fsgt': { return fsgtdb.get(id); break; }
		case 'personnel': { return persdb.get(id); break; }
		case 'intelligence': { return inteldb.get(id); break; }
		case 'operations': { return opsdb.get(id); break; }
		case 'logistics': { return logdb.get(id); break; }
		case 'signal': { return sigdb.get(id); break; }
		case 'cmo': { return cmodb.get(id); break; }
		case 'training': { return trgdb.get(id); break; }
		case 'finance': { return findb.get(id); break; }
		case 'atr': { return atrdb.get(id); break; }
	}
}
function putDb(staff, key, data) {
	switch(staff) {
		case 'co': { codb.put({ id: key, data: data }); break; }
		case 'exo': { exodb.put({ id: key, data: data }); break; }
		case 'fsgt': { fsgtdb.put({ id: key, data: data }); break; }
		case 'personnel': { persdb.put({ id: key, data: data }); break; }
		case 'intelligence': { inteldb.put({ id: key, data: data }); break; }
		case 'operations': { opsdb.put({ id: key, data: data }); break; }
		case 'logistics': { logdb.put({ id: key, data: data }); break; }
		case 'signal': { sigdb.put({ id: key, data: data }); break; }
		case 'cmo': { cmodb.put({ id: key, data: data }); break; }
		case 'training': { trgdb.put({ id: key, data: data }); break; }
		case 'finance': { findb.put({ id: key, data: data }); break; }
		case 'atr': { atrdb.put({ id: key, data: data }); break; }
	}
}
function delOne(staff, id) {
	switch(staff) {
		case 'co': { return codb.remove(id); break; }
		case 'exo': { return exodb.remove(id); break; }
		case 'fsgt': { return fsgtdb.remove(id); break; }
		case 'personnel': { return persdb.remove(id); break; }
		case 'intelligence': { return inteldb.remove(id); break; }
		case 'operations': { return opsdb.remove(id); break; }
		case 'logistics': { return logdb.remove(id); break; }
		case 'signal': { return sigdb.remove(id); break; }
		case 'cmo': { return cmodb.remove(id); break; }
		case 'training': { return trgdb.remove(id); break; }
		case 'finance': { return findb.remove(id); break; }
		case 'atr': { return atrdb.remove(id); break; }
	}
}

module.exports = router;
