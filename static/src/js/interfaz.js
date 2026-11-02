const logoutBtn = document.getElementById("logout-btn");
const addBirdBtn = document.getElementById("add-bird-btn");
const listBirdBtn = document.getElementById("list-bird-btn");
const statsBirdBtn = document.getElementById("stats-bird-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/logout";
  });
}

if (addBirdBtn) {
  addBirdBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/form";
  });
}

if (listBirdBtn) {
  listBirdBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "Listado.html";
  });
}

if (statsBirdBtn) {
  statsBirdBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "Estadisticas.html";
  });
}