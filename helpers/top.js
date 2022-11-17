let top = (title) => {
return `<!DOCTYPE html>
<html>
<head>
	<title>${title.toUpperCase()}</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="/bootstrap/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="/sweetalert2/dist/sweetalert2.min.css" />
  <link rel="stylesheet" href="/paginationjs/dist/pagination.css" />
  <link rel="stylesheet" href="/style.css" />
  <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
</head>
<body>

  <!-- Navigation Bar -->
  <nav class="navbar navbar-dark bg-primary position-relative d-flex justify-content-center p-2">
    <a class="navbar-brand headerTitle" href="/">
      ${title.toUpperCase()}
    </a>
  </nav>
  <!-- * Navigation Bar -->

  <div class="container py-3">
    <div class="row d-flex justify-content-center mb-3">
      <div class="col-sm-6">`;
};

module.exports = top;
