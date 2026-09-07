  const logoutButton = document.getElementById("logout-btn");
  const ListButton = document.getElementById("list-bird-btn");
  const statsButton = document.getElementById("stats-btn");
  const addButton = document.getElementById("add-btn");

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

  if (addButton) {
    addButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "../html/Formulario.html";
    });
  }

  const filtroTipo = document.getElementById("filtro-tipo");
  const ordenTipo = document.getElementById("orden-tipo");
  const tbody = document.querySelector("#tabla-interactiva tbody");

  const filtrarTabla = () => {
    if (!tbody || !filtroTipo) return;

    const valorFiltro = filtroTipo.value.toLowerCase();
    const filas = tbody.querySelectorAll("tr");

    filas.forEach((fila) => {
      const celdaTipo = fila.children[3];
      if (celdaTipo) {
        const tipo = celdaTipo.innerText.trim().toLowerCase();
        if (valorFiltro === "" || tipo === valorFiltro) {
          fila.style.display = "";
        } else {
          fila.style.display = "none";
        }
      }
    });
  };

  const ordenarTabla = () => {
    if (!tbody || !ordenTipo) return;

    const valorOrden = ordenTipo.value;
    if (!valorOrden) return;
    const filasArray = Array.from(tbody.querySelectorAll("tr"));

    filasArray.sort((filaA, filaB) => {
      if (valorOrden === "fecha-decr"){
        const fechaA = new Date(filaA.children[0].innerText.replace("\n", " ").trim());
        const fechaB = new Date(filaB.children[0].innerText.replace("\n", " ").trim());
        return fechaB-fechaA;
      }

      if (valorOrden === "fecha-crec"){
        const fechaA = new Date(filaA.children[0].innerText.replace("\n", " ").trim());
        const fechaB = new Date(filaB.children[0].innerText.replace("\n", " ").trim());
        return fechaA-fechaB;
      }

      if (valorOrden === "lugar-decr"){
        const lugarA = filaA.children[1].innerText + " " + filaA.children[2].innerText;
        const lugarB = filaB.children[1].innerText + " " + filaB.children[2].innerText;
        return lugarA.localeCompare(lugarB);
      }

      if (valorOrden === "lugar-crec"){
        const lugarA = filaA.children[1].innerText + " " + filaA.children[2].innerText;
        const lugarB = filaB.children[1].innerText + " " + filaB.children[2].innerText;
        return lugarB.localeCompare(lugarA);
      }
      return 0;
    });
    
    filasArray.forEach((fila) => {
    tbody.appendChild(fila);
  });
};

  if (filtroTipo) {
    filtroTipo.addEventListener("change", filtrarTabla);
  }

  if (ordenTipo) {
    ordenTipo.addEventListener("change", ordenarTabla);
  }



