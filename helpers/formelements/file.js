let file = (id, instruction) => {
  return `
    <div class="form-group mt-3 mb-3">
      <input type="file" id="${id}" name="${id}"><br>
      <small class="form-text text-muted">${instruction}</small>
    </div>
  `;
};

module.exports = file;