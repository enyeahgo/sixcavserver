let validate = (formid, btnid, inputArr) => {
  let inputs = '';
  inputArr.forEach(i => {
    if(i.split('-')[0] == 's') {
      inputs += `(document.getElementById('${i.split('-')[1]}').selectedIndex > 0) && `;
    } else {
      inputs += `(document.getElementById('${i}').value != '') && `;
    }
  });
  inputs += 'true';
  return `
    <script type="text/javascript">
      document.getElementById('${btnid}').addEventListener('click', () => {
        if(${inputs}) {
          document.getElementById('${formid}').submit();
        } else {
          Swal.fire('Error', 'Please check if you filled-up all items.', 'error');
        }
      });
    </script>
  `;
};

module.exports = validate;