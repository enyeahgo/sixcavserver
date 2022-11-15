let datePicker = (id, initVal, label, instruction) => {
  return `
    <div class="form-group mt-3 mb-3">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">${label}</span>
        </div>
        <input type="date" class="form-control" id="${id}" name="${id}" value="${initVal}" />
      </div>
      <small class="form-text text-muted">${instruction}</small>
    </div>
  `;
}

module.exports = datePicker;