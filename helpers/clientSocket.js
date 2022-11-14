let clientSocket = `
  <script type="module">
    import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
    const socket = io();
    socket.emit('join', 'Hello World');
  </script>
`;

module.exports = clientSocket;