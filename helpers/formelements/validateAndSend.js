let validateAndSend = (url, btnid, inputArr, staff) => {
  let inputs = '';
  let postBody = '';
  let resetForm = '';
  inputArr.forEach(i => {
    if(i.split('-')[0] == 's') {
      inputs += `(document.getElementById('${i.split('-')[1]}').selectedIndex > 0) && `;
      postBody += `"${i.split('-')[1]}": document.getElementById('${i.split('-')[1]}').value, `;
      resetForm += `document.getElementById('${i.split('-')[1]}').selectedIndex = 0; `
    } else {
      inputs += `(document.getElementById('${i}').value != '') && `;
      postBody += `"${i}": document.getElementById('${i}').value, `;
      resetForm += `document.getElementById('${i}').value = ''; `
    }
  });
  inputs += 'true';

  return `
    <script type="text/javascript">
      const socket = io();
      document.getElementById('${btnid}').addEventListener('click', () => {
        if(${inputs}) {
          axios.post('${url}', {
            ${postBody}
          }).then(response => {
            toast(response.data, 'success');
            ${resetForm}
          });
          socket.emit('dbchanged', '${staff}');
        } else {
          toast('Please fill-out all items.', 'error');
        }
      });
    </script>
  `;
};

module.exports = validateAndSend;