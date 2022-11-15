let amountInput = (id, initVal, instruction) => {
  return `
    <div class="form-group mt-3 mb-3">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">₱</span>
        </div>
        <input type="number" class="form-control" id="${id}" name="${id}" value="${initVal}" />
      </div>
      <small class="form-text text-muted">${instruction}</small>
    </div>
  `;
};

module.exports = amountInput;