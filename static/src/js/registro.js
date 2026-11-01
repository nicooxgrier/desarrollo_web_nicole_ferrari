let selectRegion = document.getElementById("region");
let selectComuna = document.getElementById("comuna");

if (selectRegion && selectComuna){
  selectRegion.addEventListener("change", async () => {
    let seleccion = selectRegion.value;

    while (selectComuna.firstChild){
      selectComuna.removeChild(selectComuna.firstChild);
    }
    
    let opcionDefault = document.createElement("option");
    opcionDefault.value = "";
    opcionDefault.innerText = "--Seleccione--";
    selectComuna.appendChild(opcionDefault);

    if (seleccion){
      try {
        const respuesta = await fetch(`/api/comunas/${seleccion}`);
        const comunas = await respuesta.json();

        comunas.forEach((comuna) => {
          let opcion = document.createElement("option");
          opcion.value = comuna.id;
          opcion.innerText = comuna.nombre;
          selectComuna.appendChild(opcion);
        });
      } catch (error) {
        console.error("Error al obtener las comunas:", error);
      }
    }
  });
}

const validadorNombre = (nombre) => {
  return nombre && nombre.trim().length >=3;
};

const validadorUserName = (username) => {
  return username && username.trim().length >= 4;
};

const validadorNumero = (numero) =>{
  if (!numero) return false;
  let limpio = "";
  for (let i = 0; i < numero.length; i++){
    let caracter = numero[i];
    if (caracter !== " "){
      limpio += caracter;
    }
  }

  if (limpio.startsWith("+56")){
    limpio = limpio.slice(3);
  } else if (limpio.startsWith("56")){
    limpio = limpio.slice(2);
  }

  if (limpio.length !== 9 || !limpio.startsWith("9")){
    return false;
  }

  for (let i = 0; i < limpio.length; i++){
    let caracter = limpio[i];
    if (caracter < "0" || caracter > "9"){
      return false;
    }
  }
  return true; 
};

const validadorMail = (mail) => {
  if (!mail) return false;
  let texto= mail.trim();

  if (texto.includes(" ")) return false;

  const arrobaIndex = texto.indexOf("@");
  if (arrobaIndex === -1 ||arrobaIndex !== texto.lastIndexOf("@") || arrobaIndex === 0 || arrobaIndex === texto.length -1){
    return false;
  }

  const dominio = texto.slice(arrobaIndex+1);
  const punto = dominio.lastIndexOf(".");
  if (punto <= 0 || punto === dominio.length -1){
    return false;
  }

  return dominio.slice(punto+1).length >=2;
};


const validadorSelect = (valor) => {
  return valor !== "";
}; 
const validarForm = (event) => {

  const valnombre = document.getElementById("nombre").value;
  const valuser = document.getElementById("usuario").value;
  const valnumero = document.getElementById("numero").value;
  const email = document.getElementById("email").value;
  const region = document.getElementById("region").value;
  const comuna = document.getElementById("comuna").value;

  let isValid = true;
    
  if (!validadorNombre(valnombre)){
    document.getElementById("error-nombre").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-nombre").classList.remove("visible");
  }

  if (!validadorUserName(valuser)){
    document.getElementById("error-usuario").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-usuario").classList.remove("visible");
  }
  if (!validadorNumero(valnumero)){
    document.getElementById("error-numero").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-numero").classList.remove("visible");
  }
  if (!validadorMail(email)){
    document.getElementById("error-email").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-email").classList.remove("visible");
  }
  if (!validadorSelect(region)){
    document.getElementById("error-region").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-region").classList.remove("visible");
  }
  if (!validadorSelect(comuna)){
    document.getElementById("error-comuna").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("error-comuna").classList.remove("visible");
  }

    if (!isValid){
      event.preventDefault();
    }
};

let formRegistro = document.getElementById("form-registro");
formRegistro.addEventListener("submit", validarForm);