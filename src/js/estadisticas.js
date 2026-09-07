const logoutButton = document.getElementById("logout-btn");
const ListButton = document.getElementById("list-bird-btn");
const statsButton = document.getElementById("stats-bird-btn");

  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "../html/Registro.html";
    });
  }

  if (ListButton) {
    ListButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "../html/Listado.html";
    });
  }
  if (statsButton) {
    statsButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "../html/Estadisticas.html";
    });
  }