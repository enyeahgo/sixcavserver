var titlize = require('../titlize');

let textInput = (id, instruction) => {
  return `
    <div class="form-group mt-3 mb-3">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">${titlize(id)}</span>
        </div>
        <input type="text" class="form-control" id="${id}" name="${id}" placeholder="Type ${id} here..." />
      </div>
      <small class="form-text text-muted">${instruction}</small>
    </div>
  `;
};

module.exports = textInput;