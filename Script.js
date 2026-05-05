function login() {

let usuario = document.getElementById("usuario").value;
let clave = document.getElementById("clave").value;

if(usuario === "admin" && clave === "1234"){
    alert("Bienvenido");
} else {
    alert("Usuario o contraseña incorrecta");
}

}