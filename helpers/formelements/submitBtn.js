let submitBtn = (id, label) => {
  return `
    <div class="d-flex justify-content-center">
      <button id="${id}" class="btn btn-lg btn-primary">${label}</button>
    </div>
  `;
};

module.exports = submitBtn;