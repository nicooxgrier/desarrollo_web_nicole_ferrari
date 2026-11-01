let selectRegion = document.getElementById("region");
let selectComuna = document.getElementById("comuna");

if (selectRegion && selectComuna) {
  selectRegion.addEventListener("change", async () => {
    let regionId = selectRegion.value;

    // Limpiar comunas anteriores
    while (selectComuna.firstChild) {
      selectComuna.removeChild(selectComuna.firstChild);
    }
    
    let opcionDefault = document.createElement("option");
    opcionDefault.value = "";
    opcionDefault.innerText = "-- Seleccione --";
    selectComuna.appendChild(opcionDefault);

    if (regionId) {
      try {
        const respuesta = await fetch(`/api/comunas/${regionId}`);
        const comunas = data = await respuesta.json();

        comunas.forEach((comuna) => {
          let opcion = document.createElement("option");
          opcion.value = comuna.id;     // ID real de la comuna en la BD
          opcion.innerText = comuna.nombre; // Nombre real de la comuna
          selectComuna.appendChild(opcion);
        });
      } catch (error) {
        console.error("Error al obtener las comunas:", error);
      }
    }
  });
}

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
  selectRegion.addEventListener("change", () => {
    let seleccion = selectRegion.value;

    while (selectComuna.firstChild){
      selectComuna.removeChild(selectComuna.firstChild);
    }
    
    let opcionDefault = document.createElement("option");
    opcionDefault.value = "";
    opcionDefault.innerText = "--Seleccione--";
    selectComuna.appendChild(opcionDefault);

    if (seleccion && regionesComunas[seleccion]){
      regionesComunas[seleccion].forEach((comuna) =>{

        let opcion = document.createElement("option");
        opcion.value = comuna;
        opcion.innerText = comuna;
        selectComuna.appendChild(opcion);
      });
    }
  });

const foto1 = document.getElementById("foto1");
const foto2 = document.getElementById("foto2");
const foto3 = document.getElementById("foto3");
const foto4 = document.getElementById("foto4");
const foto5 = document.getElementById("foto5");

function mostrarSiguiente(actual, siguiente) {
  if (actual && siguiente) {
    actual.addEventListener("change", () => {
      if (actual.files.length > 0) {
        siguiente.hidden = false;
      }
    });
  }
}
mostrarSiguiente(foto1, foto2);
mostrarSiguiente(foto2, foto3);
mostrarSiguiente(foto3, foto4);
mostrarSiguiente(foto4, foto5);

const inputFecha = document.getElementById("fecha");
if (inputFecha) {
  let hoy = new Date();
  const formateado = hoy.toISOString().slice(0,16);
  inputFecha.value = formateado;
  inputFecha.max = formateado;
}

const validadorFecha = (fecha) => {
  if (!fecha) return false;
  let fechaIngresada = new Date(fecha);
  let ahora = new Date();
  return !isNaN(fechaIngresada.getTime()) && fechaIngresada <= ahora;
};

const validadorTexto = (texto, min) => {
  return texto && texto.trim().length >= min;
};

const validadorSelect = (valor) => {
  return valor !== "";
};

const validadorArchivos = () => {
  const fotos = [foto1, foto2, foto3, foto4, foto5];
  for (let i = 0; i < fotos.length; i++) {
    if (fotos[i] && fotos[i].files && fotos[i].files.length > 0) {
      return true;
    }
  }
  return false;
};

function validarForm(){
  const valnombre = document.getElementById("nombre").value;
  const valtipo = document.getElementById("filtro-tipo").value;
  const valregion = document.getElementById("region").value;
  const valcomuna = document.getElementById("comuna").value;
  const valfecha = document.getElementById("fecha").value;

  let isValid = true; 

  if(!validadorTexto(valnombre, 3)){
    document.getElementById("error-nombre").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-nombre").classList.remove("visible");
  }

if(!validadorSelect(valtipo)){
    document.getElementById("error-tipo").classList.add("visible");
    isValid = false;
  }else {
    document.getElementById("error-tipo").classList.remove("visible");
  }

if(!validadorSelect(valregion)){
    document.getElementById("error-region").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-region").classList.remove("visible");
  }

if(!validadorSelect(valcomuna)){
    document.getElementById("error-comuna").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-comuna").classList.remove("visible");
  }

if(!validadorFecha(valfecha)){
    document.getElementById("error-fecha").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-fecha").classList.remove("visible");
  }

if(!validadorArchivos()){
    document.getElementById("error-fotos").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-fotos").classList.remove("visible");
  }


if (isValid){
  const archivo = foto1.files[0];
  const lector = new FileReader();
  lector.onload = function(e) {
    const nuevoAvistamiento = {
      nombre: valnombre,
      tipo: valtipo,
      lugar: vallugar,
      comuna: valcomuna,
      region: valregion,
      fecha: valfecha,
      foto: e.target.result
    };
    const lista = JSON.parse(sessionStorage.getItem("avistamientos")) || [];
    lista.unshift(nuevoAvistamiento);
    sessionStorage.setItem("avistamientos", JSON.stringify(lista));
    
    alert("Avistamiento registrado exitosamente.");
    window.location.href = "Interfaz.html";
  };

  if (archivo) {
    lector.readAsDataURL(archivo);
  } else {
    window.location.href = "Interfaz.html";
  }
}
}