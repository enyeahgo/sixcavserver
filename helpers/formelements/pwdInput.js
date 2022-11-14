let pwdInput = (id, instruction) => {
  return `
    <div class="form-group mt-3 mb-3">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">
            <ion-icon name="lock-closed-outline" style="font-size: 23px;"></ion-icon>
          </span>
        </div>
        <input type="password" class="form-control" id="${id}" name="${id}" />
      </div>
      <small class="form-text text-muted">${instruction}</small>
    </div>
  `;
};

module.exports = pwdInput;