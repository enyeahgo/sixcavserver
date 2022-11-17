let footer = (blockOrNone) => {
  return `
    <footer id="footer" style="display: ${blockOrNone};">
      <div class="py-4 my-4 text-center border-top">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: bold;">VANGUARD &copy; 2022</span><br>
        <span class="sm">Enliven Technologies Philippines All rights reserved.</span>
      </div>
    </footer>
  `;
}

module.exports = footer;