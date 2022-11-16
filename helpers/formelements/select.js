var titlize = require('../titlize');

let select = (id, initVal, instruction, options) => {
  let parsedOptions = '';
  let values = [];
  let texts = [];
  options.forEach(o => {
    values.push(o.split('-')[0]);
    texts.push(o.split('-')[1]);
  });
  let c = 0;
  let forEdit = false;
  values.map(v => {
    if(v == initVal.toString()) {
      forEdit = true;
      parsedOptions += `<option value="${v}" selected>${texts[c]}</option>`;
    } else {
      parsedOptions += `<option value="${v}">${texts[c]}</option>`;
    }
    c++;
  });
  if(forEdit) {
    return `
      <div class="form-group">
        <select class="form-control" id="${id}" name="${id}">
          <option disabled>Choose ${instruction}</option>
          ${parsedOptions}
        </select>
        <small class="form-text text-muted">${instruction}</small>
      </div>
    `;
  } else {
    return `
      <div class="form-group">
        <select class="form-control" id="${id}" name="${id}">
          <option selected disabled>Choose ${instruction}</option>
          ${parsedOptions}
        </select>
        <small class="form-text text-muted">${instruction}</small>
      </div>
    `;
  }
};

module.exports = select;