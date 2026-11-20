const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "Interfaz.html";
  });
}

const formBuscar = document.getElementById("form-buscar");
const input = document.getElementById("q");
const estado = document.getElementById("estado");
const tabla = document.getElementById("tabla");
const tbody = document.getElementById("tbody");

if (formBuscar) {
  formBuscar.addEventListener("submit", (e) => {
    e.preventDefault();
  });
}

const resaltar = (texto, patron) => {
  const frag = document.createDocumentFragment();
  const lower = texto.toLowerCase();
  const lowerPatron = patron.toLowerCase();
  let i = 0;
  let idx = lower.indexOf(lowerPatron);

  while (idx !== -1) {
    if (idx > i) {
      frag.appendChild(document.createTextNode(texto.slice(i, idx)));
    }
    const mark = document.createElement("mark");
    mark.textContent = texto.slice(idx, idx + patron.length);
    frag.appendChild(mark);
    i = idx + patron.length;
    idx = lower.indexOf(lowerPatron, i);
  }

  if (i < texto.length) {
    frag.appendChild(document.createTextNode(texto.slice(i)));
  }
  return frag;
};

if (input) {
  input.addEventListener("input", async () => {
    const q = input.value.trim();

    if (!q) {
      tabla.hidden = true;
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }
      estado.textContent = "Escribe para comenzar a buscar avistamientos.";
      estado.parentElement.hidden = false;
      return;
    }

    try {
      const response = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
      const data = await response.json();

      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }

      if (data.length === 0) {
        tabla.hidden = true;
        estado.textContent = "No se encontraron resultados";
        estado.parentElement.hidden = false;
        return;
      }

      estado.parentElement.hidden = true;
      tabla.hidden = false;

      data.forEach((item) => {
        const tr = document.createElement("tr");
        const tdVoluntario = document.createElement("td");
        const tdDia = document.createElement("td");
        const tdAve = document.createElement("td");
        const tdComuna = document.createElement("td");
        const tdNota = document.createElement("td");
        const tdAccion = document.createElement("td");

        tdVoluntario.appendChild(resaltar(item.voluntario, q));
        tdDia.textContent = item.dia;
        tdAve.appendChild(resaltar(item.ave, q));
        tdComuna.appendChild(resaltar(item.comuna, q));
        tdNota.textContent = item.nota;

        const btnEvaluar = document.createElement("button");
        btnEvaluar.type = "button";
        btnEvaluar.textContent = "Evaluar";

        btnEvaluar.addEventListener("click", () => {
          if (tdAccion.querySelector(".panel-evaluar")) return;

          const panelEvaluar = document.createElement("span");
          panelEvaluar.className = "panel-evaluar";

          const selectNota = document.createElement("select");
          for (let n = 1; n <= 7; n++) {
            const option = document.createElement("option");
            option.value = n;
            option.textContent = n;
            selectNota.appendChild(option);
          }

          const btnOk = document.createElement("button");
          btnOk.type = "button";
          btnOk.textContent = "OK";

          btnOk.addEventListener("click", async () => {
            const res = await fetch(`/api/avistamientos/${item.id}/notas`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nota: Number(selectNota.value) })
            });
            const resp = await res.json();
            if (res.ok) {
              tdNota.textContent = resp.promedio;
              panelEvaluar.remove();
            } else {
              alert(resp.error || "Error al guardar la nota.");
            }
          });

          panelEvaluar.append(selectNota, btnOk);
          tdAccion.appendChild(panelEvaluar);
        });

        tdAccion.appendChild(btnEvaluar);

        tr.appendChild(tdVoluntario);
        tr.appendChild(tdDia);
        tr.appendChild(tdAve);
        tr.appendChild(tdComuna);
        tr.appendChild(tdNota);
        tr.appendChild(tdAccion);

        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error al buscar avistamientos:", error);
      estado.textContent = "Error al consultar los avistamientos.";
      estado.parentElement.hidden = false;
      tabla.hidden = true;
    }
  });
}