let hidden = (id, value) => {
  return `
    <input type="hidden" id="${id}" name="${id}" value="${value}" />
  `;
};

module.exports = hidden;