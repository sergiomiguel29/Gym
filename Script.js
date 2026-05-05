/* ================= LOGIN ================= */

// AUTO LOGIN (si ya inició sesión)
window.onload = function(){
    if(localStorage.getItem("login") === "true"){
        mostrarPanel();
    }
}

function login() {

    let usuario = document.getElementById("usuario").value.trim();
    let clave = document.getElementById("clave").value.trim();

    if(usuario === "admin" && clave === "1234"){

        localStorage.setItem("login", "true");
        mostrarPanel();

    } else {
        alert("Usuario o contraseña incorrecta");
    }
}

function mostrarPanel(){
    document.getElementById("login").style.display = "none";

    let panel = document.getElementById("panel");
    panel.style.display = "flex"; // importante para layout
}

function cerrar(){
    localStorage.removeItem("login");
    document.getElementById("panel").style.display = "none";
    document.getElementById("login").style.display = "flex";
}


/* ================= DATA ================= */

let clientesData = JSON.parse(localStorage.getItem("clientes")) || [
    {nombre:"Juan Pérez",plan:"Mensual",estado:"Activo"},
    {nombre:"María López",plan:"Trimestral",estado:"Activo"},
    {nombre:"Carlos Díaz",plan:"Mensual",estado:"Moroso"}
];

let indexEdit = null;

function guardarStorage(){
    localStorage.setItem("clientes", JSON.stringify(clientesData));
}


/* ================= CLIENTES ================= */

function clientes(){

    document.getElementById("contenido").innerHTML = `
        <h1>Clientes</h1>

        <input id="buscar" placeholder="Buscar cliente...">

        <button class="accion buscarbtn" onclick="buscar()">Buscar</button>
        <button class="accion mostrarbtn" onclick="renderClientes()">Mostrar Todos</button>
        <button class="accion guardar" onclick="abrirAgregar()">+ Nuevo Cliente</button>

        <div class="clientes-grid" id="gridClientes"></div>
    `;

    renderClientes();
}


/* RENDER */
function renderClientes(){

    let grid = document.getElementById("gridClientes");
    if(!grid) return;

    grid.innerHTML = "";

    clientesData.forEach((c,i)=>{

        grid.innerHTML += `
        <div class="card">
            <h3>${c.nombre}</h3>
            <p>Plan: ${c.plan}</p>

            <span class="tag ${c.estado.toLowerCase()}">${c.estado}</span>

            <br><br>

            <button class="accion editar" onclick="editar(${i})">Editar</button>
            <button class="accion eliminar" onclick="eliminar(${i})">Eliminar</button>
        </div>
        `;
    });
}


/* BUSCAR */
function buscar(){

    let texto = document.getElementById("buscar").value.toLowerCase();

    let filtrados = clientesData.filter(c =>
        c.nombre.toLowerCase().includes(texto)
    );

    let grid = document.getElementById("gridClientes");
    grid.innerHTML = "";

    filtrados.forEach((c,i)=>{

        grid.innerHTML += `
        <div class="card">
            <h3>${c.nombre}</h3>
            <p>Plan: ${c.plan}</p>

            <span class="tag ${c.estado.toLowerCase()}">${c.estado}</span>
        </div>
        `;
    });
}


/* ================= AGREGAR ================= */

function abrirAgregar(){
    document.getElementById("modalAgregar").style.display = "flex";
}

function cerrarAgregar(){
    document.getElementById("modalAgregar").style.display = "none";
}

function agregarCliente(){

    let nombre = document.getElementById("nuevoNombre").value.trim();
    let plan = document.getElementById("nuevoPlan").value.trim();
    let estado = document.getElementById("nuevoEstado").value.trim();

    if(!nombre || !plan || !estado){
        alert("Completa todos los campos");
        return;
    }

    clientesData.push({nombre, plan, estado});

    guardarStorage();
    cerrarAgregar();
    renderClientes();
}


/* ================= EDITAR ================= */

function editar(i){

    indexEdit = i;

    document.getElementById("editNombre").value = clientesData[i].nombre;
    document.getElementById("editPlan").value = clientesData[i].plan;
    document.getElementById("editEstado").value = clientesData[i].estado;

    document.getElementById("modalEditar").style.display = "flex";
}

function guardarEdicion(){

    let nombre = document.getElementById("editNombre").value.trim();
    let plan = document.getElementById("editPlan").value.trim();
    let estado = document.getElementById("editEstado").value.trim();

    if(!nombre || !plan || !estado){
        alert("Completa todos los campos");
        return;
    }

    clientesData[indexEdit] = {nombre, plan, estado};

    guardarStorage();
    cerrarModal();
    renderClientes();
}

function cerrarModal(){
    document.getElementById("modalEditar").style.display = "none";
}


/* ================= ELIMINAR ================= */

function eliminar(i){

    if(confirm("¿Eliminar cliente?")){
        clientesData.splice(i,1);
        guardarStorage();
        renderClientes();
    }
}


/* ================= DASHBOARD ================= */

function dashboard(){
    document.getElementById("contenido").innerHTML = `
        <h1>Dashboard</h1>
        <p>Total clientes: ${clientesData.length}</p>
    `;
}


/* ================= REPORTES ================= */

function reportes(){
    document.getElementById("contenido").innerHTML = `
        <h1>Reportes</h1>
        <p>Próximamente...</p>
    `;
}