var titlize = require('../titlize');

let select = (id, initVal, instruction, options) => {
  let parsedOptions = '';
  let values = Object.keys(options);
  let texts = Object.values(options);
  let c = 0;
  values.map(v => {
    if(v == initVal) {
      parsedOptions += `<option value="${v}" selected>${texts[c]}</option>`;
    } else {
      parsedOptions += `<option value="${v}">${texts[c]}</option>`;
    }
    c++;
  });
  return `
    <div class="form-group">
      <select class="form-control" id="${id}" name="${id}">
        <option disabled>Choose ${titlize(id)}</option>
        ${parsedOptions}
      </select>
      <small class="form-text text-muted">${instruction}</small>
    </div>
  `;
};

module.exports = select;