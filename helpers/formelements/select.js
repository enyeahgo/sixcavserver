var titlize = require('../titlize');

let select = (id, instruction, options) => {
  let parsedOptions = '';
  let values = Object.keys(options);
  let texts = Object.values(options);
  let c = 0;
  values.map(v => {
    parsedOptions += `<option value="${v}">${texts[c]}</option>`;
    c++;
  });
  return `
    <div class="form-group">
      <select class="form-control" id="${id}" name="${id}">
        <option selected disabled>Choose ${titlize(id)}</option>
        ${parsedOptions}
      </select>
      <small class="form-text text-muted">${instruction}</small>
    </div>
  `;
};

module.exports = select;