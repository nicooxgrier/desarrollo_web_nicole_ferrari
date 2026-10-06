const logoutButton = document.getElementById("logout-btn");
const addButton = document.getElementById("add-btn");
const listButton = document.getElementById("list-bird-btn");
const statsButton = document.getElementById("stats-btn");

if (logoutButton) {
  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../html/Registro.html";
  });
}

if (addButton) {
  addButton.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "../html/Formulario.html";
  });
}

if (listButton) {
  listButton.addEventListener("click", (event) => {
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
