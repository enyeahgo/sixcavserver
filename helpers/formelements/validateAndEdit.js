let validateAndSend = (url, btnid, inputArr, staff) => {
  let inputs = '';
  let postBody = '';
  inputArr.forEach(i => {
    if(i.split('-')[0] == 's') {
      inputs += `(document.getElementById('${i.split('-')[1]}').selectedIndex > 0) && `;
      postBody += `"${i.split('-')[1]}": document.getElementById('${i.split('-')[1]}').value, `;
    } else {
      inputs += `(document.getElementById('${i}').value != '') && `;
      postBody += `"${i}": document.getElementById('${i}').value, `;
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
            "apbBased": document.getElementById('apbBased').value,
            "hasAar": document.getElementById('hasAar').value,
            "hasFur": document.getElementById('hasFur').value,
            "amount": document.getElementById('amount').value,
          }).then(response => {
            toast(response.data, 'success');
          });
          socket.emit('dbchanged', '${staff}');
          setTimeout(()=>{
            location.href = '/records/${staff}';
          }, 1500);
        } else {
          toast('Please fill-out all items.', 'error');
        }
      });

      socket.on('dbchanged', staff => {
				console.log(staff);
			});

    </script>
  `;
};

module.exports = validateAndSend;