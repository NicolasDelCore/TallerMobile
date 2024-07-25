//Variables globalescencistaGPS
let usuarioLogueado = false;
let departamentos = [];
let ciudades = [];
let todasLasCiudades = [];
let ocupaciones = [];
let personasCensadas = [];
let cencistaGPS = geolocalizar();
let map;
let marcadorCensita;
let marcadoresCiudades;
let mapCirculo;
const ruteo = document.querySelector("#ruteo");
const menu  = document.querySelector("#menu");
ruteo.addEventListener("ionRouteWillChange",NavegarEntrePags); //Eventos de ruteo para el menú

//Inicializar app
hayUsuario();

function NavegarEntrePags(evento){
    //console.log(evento); console.log(evento.detail); console.log(evento.detail.to);
    if(evento.detail.to == "/"){
        HTMLPageLogin();
    } else if(evento.detail.to == "/Registro"){
        HTMLPageRegistro();
    } else if (evento.detail.to == "/Censar") {
        HTMLPageCensar();
    } else if (evento.detail.to == "/PersonasCensadas") {
        HTMLPagePersonasCendadas();
    } else if(evento.detail.to == "/Map"){
        HTMLPageMap();    
    } else if(evento.detail.to == "/CerrarSesion"){
        logoutCencista();
    }
}

function CerrarMenu(){
    menu.close();
}

function OcultarTodo() {
    document.querySelector("#pageLogin").style.display = "none";
    document.querySelector("#pageRegistro").style.display = "none";
    document.querySelector("#pageCensar").style.display = "none";
    document.querySelector("#pagePersonasCensadas").style.display = "none";
    document.querySelector("#pageMap").style.display = "none";
    document.querySelector("#btnMenuLogin").style.display = "none";
    document.querySelector("#btnMenuRegistro").style.display = "none";
    document.querySelector("#btnMenuCerrarSesion").style.display = "none";
    document.querySelector("#btnMenuCensar").style.display = "none";
    document.querySelector("#btnMenuPersonasCensadas").style.display = "none";
    document.querySelector("#btnMenuMap").style.display = "none";
}

function MostrarPag(id){
    OcultarTodo();
    document.querySelector(`#${id}`).style.display = "revert";
}

function HTMLPageLogin(){
    MostrarPag("pageLogin");
    document.querySelector("#btnMenuLogin").style.display = "revert";
    document.querySelector("#btnMenuRegistro").style.display = "revert";
    document.querySelector("#btnLogin").addEventListener("click",loginDesdeHTML);
}

function HTMLPageRegistro(){
    MostrarPag("pageRegistro");
    document.querySelector("#btnMenuLogin").style.display = "revert";
    document.querySelector("#btnMenuRegistro").style.display = "revert";
    document.querySelector("#btnRegistroUsuario").addEventListener("click",registrarCencista);
}

function HTMLPageCensar(){
    MostrarPag("pageCensar");
    EventosParaFormCenso();
    document.querySelector("#btnMenuCensar").style.display = "revert";
    document.querySelector("#btnMenuPersonasCensadas").style.display = "revert";
    document.querySelector("#btnMenuMap").style.display = "revert";        
    document.querySelector("#btnMenuCerrarSesion").style.display = "revert";
    censadosPorUsuario();
}

function HTMLPagePersonasCendadas(){
    MostrarPag("pagePersonasCensadas");
    document.querySelector("#btnMenuCensar").style.display = "revert";
    document.querySelector("#btnMenuPersonasCensadas").style.display = "revert";
    document.querySelector("#btnMenuMap").style.display = "revert";        
    document.querySelector("#btnMenuCerrarSesion").style.display = "revert";
    generarOpcionesHTML(ocupaciones, "sel_ocupacionFiltro", "ocupacion"); //generar opciones del select ocupaciones
    document.querySelector("#sel_ocupacionFiltro").value = "todos"; //default del select ocupaciones
    document.querySelector("#sel_ocupacionFiltro").addEventListener("ionChange",censadosPorUsuario); //agrega evento al select ocupaciones
    censadosPorUsuario(); //primera carga de la lista de censados por usuario (con filtro "todos" default)
}

function HTMLPageMap(){
    MostrarPag("pageMap");
    document.querySelector("#btnMenuMap").style.display = "revert";
    document.querySelector("#btnMenuCensar").style.display = "revert";
    document.querySelector("#btnMenuPersonasCensadas").style.display = "revert";        
    document.querySelector("#btnMenuCerrarSesion").style.display = "revert";
    document.querySelector("#mapaKms").value = "";
    document.querySelector("#btnMapaKms").addEventListener("click",radioCencista);
    crearMapa();
}

function EventosParaFormCenso(){ //Evento del formulario para censar ciudadanos
    document.querySelector("#sel_departamento").addEventListener("ionChange",EventoSelectDepartamento);
    document.querySelector("#btnCensar").addEventListener("click",agregarCensado);
    //limpieza de datos cacheados
    document.querySelector("#censarNombre").value = "";   
    document.querySelector("#censarNacimiento").value = "";
    document.querySelector("#sel_ciudad").value = "";
    document.querySelector("#sel_departamento").value = "";
    document.querySelector("#sel_ocupacion").value = "";
}

//Cuando cambia el departamento, renueva el Select de ciudad
function EventoSelectDepartamento(){
    const htmlSel = document.querySelector("#sel_departamento");
    CiudadesPorDepartamentos(htmlSel.value);
}

function hayUsuario() {
    if (localStorage.getItem("token") !== null && localStorage.getItem("idCensista")){
        usuarioLogueado = true;
        obtener("ocupaciones");
        obtener("departamentos");        
        obtener("ciudades");
        ruteo.push("/Censar");
    }
    else {
        usuarioLogueado = false;
    }
}

function registrarCencista(){
    let usuario = document.querySelector("#registroUsuario").value;
    let password = document.querySelector("#registroPassword").value;
    let password2 = document.querySelector("#registroPassword2").value;

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let nuevoUsuario = JSON.stringify({
        "usuario": usuario,
        "password": password
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: nuevoUsuario,
        redirect: 'follow'
    };

    try{
        if(usuario.trim().length > 0 && password.trim().length > 0 && password === password2) {
            fetch("https://censo.develotion.com/usuarios.php", requestOptions)
            .then(response => response.json())            
            .then(result => {
                if(result.codigo > 199 && result.codigo < 300){ //si el registro devuelve ok, logueamos al user
                    loginCencista(usuario, password);
                    console.log(`Usuario ${usuario} con ID ${result.id} logueado.`);
                }
                else {
                    throw new Error(result.mensaje);
                }
            })
            .catch( error => tostadora("mensajeRegistro", error) );
        } else {
            throw new Error("Ingrese usuario válido y verifique contraseña.");
        }
    } catch(error) {
        tostadora("mensajeRegistro", error);
    };  
}

function loginDesdeHTML(){    
    let usuario = document.querySelector("#loginUsuario").value;
    let password = document.querySelector("#loginPassword").value;
    loginCencista(usuario, password);
}

function loginCencista(usuario, password){
    
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let nuevoUsuario = JSON.stringify({
        "usuario": usuario,
        "password": password
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: nuevoUsuario,
        redirect: 'follow'
    };

    try{
        if(usuario.trim().length > 0 && password.trim().length > 0) {
            fetch("https://censo.develotion.com/login.php", requestOptions)
            .then(response => response.json())            
            .then(result => {
                if(result.codigo > 199 && result.codigo < 300){ //si el login devuelve ok:
                        //console.log("Usuario logueado con éxito" + " " + result.codigo);
                        localStorage.setItem("token", result.apiKey);
                        localStorage.setItem("idCensista", result.id);
                        usuarioLogueado = true;
                        obtener("ocupaciones");
                        obtener("departamentos");                        
                        obtener("ciudades");
                        document.querySelector("#loginUsuario").value = "";
                        document.querySelector("#loginPassword").value = "";
                        ruteo.push("/Censar");
                }
                else {
                    throw new Error(result.mensaje);
                }
            })
            .catch(error => tostadora("mensajeLogin", error) );
        } else {
            throw new Error("Ingrese usuario y contraseña");
        }
    } catch(error) {
        tostadora("mensajeLogin", error);
    };
}

function logoutCencista(){
    localStorage.clear();
    hayUsuario();
    departamentos = [];
    ciudades = [];
    ocupaciones = [];
    personasCensadas = [];
    todasLasCiudades = [];
    ruteo.push("/");
}

//Pre: toma una de las siguientes opciones de entrada: "departamentos", "ciudades" u "ocupaciones"
//Post: devuelve un array conteniendo la respuesta de la API a la consulta correspondiente
function obtener(dato){
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("apikey", localStorage.getItem("token") );
    myHeaders.append("iduser", localStorage.getItem("idCensista") );

    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    try{
        if(usuarioLogueado) {
            if(dato == "departamentos" || dato == "ciudades" || dato == "ocupaciones" ){
                fetch("https://censo.develotion.com/"+dato+".php", requestOptions)
                .then(response => response.json())            
                .then(result => {
                    if(result.codigo > 199 && result.codigo < 300){ //si el fetch devuelve ok
                        switch (dato){                        
                            case "departamentos":
                                departamentos = result.departamentos;
                                generarOpcionesHTML(departamentos, "sel_departamento", "nombre");
                                break;
                            case "ciudades": //Se usa sólo para obtener todas las ciudades con sus datos (coordenadas) para el mapa, no se dibuja HTML
                                todasLasCiudades = result.ciudades;
                                break; 
                            case "ocupaciones":
                                ocupaciones = result.ocupaciones;
                                generarOpcionesHTML(ocupaciones, "sel_ocupacion", "ocupacion");
                                break;
                            default:
                                throw new Error("Operación inválida.");
                        }
                    }
                    else {
                        throw new Error(result.mensaje);
                    }
                })
                .catch(error => console.log(error));
            } else {
                throw new Error("Operación inválida.");
            }
        } else {
            errorRelogueoNecesario();  
        }
    } catch(error) {
        console.log(error);
    };
}

function CiudadesPorDepartamentos(departamento){
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("apikey", localStorage.getItem("token") );
    myHeaders.append("iduser", localStorage.getItem("idCensista") );

    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    try{
        if(usuarioLogueado) {
            fetch("https://censo.develotion.com/ciudades.php?idDepartamento="+departamento, requestOptions)
            .then(response => response.json())            
            .then(result => {
                if(result.codigo > 199 && result.codigo < 300){
                    ciudades = result.ciudades;
                    generarOpcionesHTML(ciudades, "sel_ciudad", "nombre");
                }
            })
        } else {
            errorRelogueoNecesario();  
        }
    } catch(error) {
        console.log(error);
    }
}

//Pre: toma nombre del array, select y la llave (del conjunto llave:valor) (ej: generarOpciones(ocupaciones, "div_ocupacion", "ocupacion"); // generarOpciones(ciudades, "div_ciudad", "nombre"); // generarOpciones(departamentos, "div_departamento", "nombre"); )
//Post: genera el HTML de un Select con las opciones correspondientes y lo pone en el div especificado
function generarOpcionesHTML(array, select, llave){
    let largo = array.length;
    let options = ""; //`<ion-select-option id = #${select} disabled>Elegir</ion-select-option>`;

    if (select == "sel_ocupacionFiltro"){ //agregamos la opción "Todos" para el filtro de personas censadas por el usuario, sólo para ese select
        options += "<ion-select-option value='todos'>Todas las ocupaciones</ion-select-option>"
    }

    for (let i = 0; i < largo; i++){
        if (llave == "nombre"){ //genera opciones de select para departamentos y ciudades con llave nombre
            options += `<ion-select-option value="${array[i].id}">${array[i].nombre}</ion-select-option>`
        } else if (llave == "ocupacion") { //genera opciones de select para ocupaciones con llave ocupacion
            options += `<ion-select-option value="${array[i].id}">${array[i].ocupacion}</ion-select-option>`
        } else {
            console.log("generarOpciones() opción 'llave' inválida para generación de HTML")
        }
    }
    options += "</select>";
    document.querySelector(`#${select}`).innerHTML = options;      
}

//Pre: Se llama con los datos del censado: nombre, fecha de nacimiento, ciudad, departamento y ocupación (en caso de ser mayor de 18) - Departamento, Ciudad y Ocupación deben coincidir con los datos obtenidos por la API, guardados en las varibles globales: departamentos, ciudades y ocupaciones
//Post: Se envía a la API una nueva persona censada con los datos mencionados arriba + el ID del Censita
function agregarCensado(){
    if(!usuarioLogueado){
        throw new Error("Por favor, inicie sesión nuevamente");
    } else {
        let cencistaID = localStorage.getItem("idCensista");
        let censadoNombre = document.querySelector("#censarNombre").value;   
        let censadoFNacimiento = document.querySelector("#censarNacimiento").value;
        let censadoCiudad = document.querySelector("#sel_ciudad").value;
        let censadoDpto = document.querySelector("#sel_departamento").value;
        let censadoOcupacion = document.querySelector("#sel_ocupacion").value;

        try{
            if(cencistaID && censadoNombre.trim().length > 0 && censadoFNacimiento.trim().length > 0 && censadoCiudad != "" && censadoDpto != "" && censadoOcupacion != "") {
                //Cálculo de 18 años
                let fechaActual = new Date();
                let fechaNac = new Date(censadoFNacimiento);
                if(censadoOcupacion != "8" && (fechaActual.getFullYear() - fechaNac.getFullYear() < 18) ){
                    throw new Error("Para menores de 18 años, seleccione 'No Trabaja'.");
                }else{
                    //fetch para postear persona censada
                    let myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");
                    myHeaders.append("apikey", localStorage.getItem("token") );
                    myHeaders.append("iduser", localStorage.getItem("idCensista") );
                    
                    let raw = JSON.stringify({
                        "idUsuario": cencistaID,
                        "nombre": censadoNombre,
                        "departamento": censadoDpto,
                        "ciudad": censadoCiudad,
                        "fechaNacimiento": censadoFNacimiento,
                        "ocupacion": censadoOcupacion
                    });

                    let requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: raw,
                        redirect: 'follow'
                    };
                                
                    try{
                        if(usuarioLogueado) {
                            fetch("https://censo.develotion.com/personas.php", requestOptions)
                            .then(response => response.json())            
                            .then(result => {
                                if(result.codigo > 199 && result.codigo < 300){
                                    tostadora("mensajeCensar", result.mensaje + " ID Censo: " + result.idCenso + " Por cencista: " + cencistaID);
                                    document.querySelector("#censarNombre").value = "";   
                                    document.querySelector("#censarNacimiento").value = "";
                                    document.querySelector("#sel_ciudad").value = "";
                                    document.querySelector("#sel_departamento").value = "";
                                    document.querySelector("#sel_ocupacion").value = "";
                                    ciudades = []; //vaciar ciudades para que no queden cacheadas para el próx censado
                                    generarOpcionesHTML(ciudades, "sel_ciudad", "nombre"); //vaciar select ciudad
                                    censadosPorUsuario();
                                } else {
                                    throw new Error ("Error: " + result.codigo + " " + result.mensaje);
                                }
                            })
                        }
                        else {
                            errorRelogueoNecesario();                       
                        }
                    } catch(error) {
                        tostadora("mensajeCensar", error + "");
                    }
                }
            } else {
                throw new Error("Datos incompletos. Verique nombre, apellido, ciudad, departamento, fecha de nacimiento y ocupación");
            }
        } catch(error) {            
            tostadora("mensajeCensar", error + "");            
        }
    }
}

function censadosPorUsuario(){    
    let cencistaID = localStorage.getItem("idCensista");
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("apikey", localStorage.getItem("token") );
    myHeaders.append("iduser", cencistaID);

    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    try {
        if(usuarioLogueado){
            fetch(`https://censo.develotion.com/personas.php?idUsuario=${cencistaID}`, requestOptions)
            .then(response => response.json())            
            .then(result => {
                if(result.codigo > 199 && result.codigo < 300){
                    personasCensadas = result.personas; //guardamos resultado en variable global personasCensadas
                    HTMLDibujarDonde(); //tostadora("mensajeListar", "Lista obtenida"); //mensaje para debug
                } else {
                    throw new Error ("Error: " + result.codigo + " " + result.mensaje);
                }
            })
        } else {
            errorRelogueoNecesario();
        }
    }
    catch(error){
        tostadora("mensajeListar", error + "");
    }
}

function borrarCensado(id){
    //fetch para postear persona censada
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("apikey", localStorage.getItem("token") );
    myHeaders.append("iduser", localStorage.getItem("idCensista") );
    
    let requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow'
    };
                
    try{
        if(usuarioLogueado) {
            fetch(`https://censo.develotion.com/personas.php?idCenso=${id}`, requestOptions)
            .then(response => response.json())            
            .then(result => {
                if(result.codigo > 199 && result.codigo < 300){
                    censadosPorUsuario();
                    tostadora("mensajeListar", result.mensaje + " ID Censo: " + id + " borrado");
                } else {
                    throw new Error ("Error: " + result.codigo + " " + result.mensaje);
                }
            })
        }
        else {
            errorRelogueoNecesario();
        }
    } catch(error) {
        tostadora("mensajeCensar", error + "");
    }

}

//Decide dónde actualizar la info traida por censadosPorUsuario (guardada en array personasCensadas)
function HTMLDibujarDonde(){
    let donde = window.location.hash; //console.log(donde);
    if (donde == "#/PersonasCensadas"){
        HTMLPersonasCensadas("personasCensadasLista");
    } else if (donde == "#/Censar"){
        HTMLEstadisticasCensar();
    }
}

function HTMLPersonasCensadas(select){    
    if(usuarioLogueado){
        let htmlLista = "";
        let largo = personasCensadas.length;
        let ocupacionSeleccionada = document.querySelector("#sel_ocupacionFiltro").value;    
        for (let i = 0; i < largo; i++){
            if( ocupacionSeleccionada == "todos" || (personasCensadas[i].ocupacion == ocupacionSeleccionada) ){
                htmlLista += `
                <ion-item>
                    <ion-label>${personasCensadas[i].nombre}</ion-label>
                    <ion-label>${personasCensadas[i].fechaNacimiento}</ion-label>
                    <ion-label>${devolverOcupacion(personasCensadas[i].ocupacion)}</ion-label>
                    <ion-button id="EliminarDatosCensado${i}" onclick=borrarCensado(${personasCensadas[i].id})>Eliminar</ion-button>
                </ion-item>
                `
            }                    
        }
        htmlLista +="<ion-item lines='none'></ion-item>"; //Esto resuelve un bug de ionic-list donde el último elemento de la lista no se muestra al hacer scroll-down: https://stackoverflow.com/questions/59187495/my-ion-list-wont-show-the-last-item-in-the-list-when-i-scroll-to-the-bottom
        document.querySelector(`#${select}`).innerHTML = htmlLista;
    } else {
        errorRelogueoNecesario();    
    }
}

function HTMLEstadisticasCensar(){

    let cantTotalPersonas = personasCensadas.length;
    let cantpersonasMontevideo = PersonasDe("Montevideo");
    let personasRestoDelPais = PersonasDe("");

    document.querySelector("#cantPersonas").innerHTML = cantTotalPersonas;
    document.querySelector("#cantPersonasMontevideo").innerHTML = cantpersonasMontevideo;
    document.querySelector("#cantPersonasRestoDelPais").innerHTML = personasRestoDelPais;
}

function devolverOcupacion(id){
    let resultado;
    let ocEncontrada = false;
    let largo = ocupaciones.length;
    for (let i = 0; i < largo && !ocEncontrada; i++){
        if (id == ocupaciones[i].id) {
            ocEncontrada = true;
            resultado = ocupaciones[i].ocupacion;
        }
    }
    return resultado;
}

function PersonasDe(dpto){
    let contador = 0;
    let largo = personasCensadas.length;
    let montevideoID = devolverDepartamentoID("Montevideo");
    for (let i = 0; i < largo; i++){
        if(personasCensadas[i].departamento == montevideoID && dpto == "Montevideo"){
            contador++;
        } else if (personasCensadas[i].departamento != montevideoID && dpto != "Montevideo") {
            contador++;
        }                    
    }
    return contador;
}

function devolverDepartamentoID(nombre){
    let resultado;
    let largo = departamentos.length;
    let dptoEncontrado = false;
    for (let i = 0; i < largo && !dptoEncontrado; i++){
        if (nombre == departamentos[i].nombre) {
            dptoEncontrado = true;
            resultado = departamentos[i].id;
        }
    }
    return resultado;
}

function crearMapa(){
    //Singleton del contenedor del mapa, para que el mapa siempre cargue bien https://github.com/Leaflet/Leaflet/issues/3962
    let container = L.DomUtil.get('map');
        if(container != null){
        container._leaflet_id = null;
    }

    if (map == undefined){
        map = L.map('map').setView(cencistaGPS, 13); //Crear mapa singleton, setView toma CencistaGPS = coordenadas, y después el zoom
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 25,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    if(marcadorCensita == undefined){
        marcadorCensita = L.marker(cencistaGPS).addTo(map); //Añadir marcador del censista al mapa
    }

    if (marcadoresCiudades == undefined){
        marcadoresCiudades = L.layerGroup(); //Grupo de marcadores para las ciudades censadas
        map.addLayer(marcadoresCiudades);
    } else {
        marcadoresCiudades.clearLayers();
    }

    if (mapCirculo == undefined) {
        mapCirculo = L.circle(cencistaGPS, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 0
        }).addTo(map);
    } else {
        mapCirculo.setRadius(0);
    }
    
    //Cuando el mapa carga por primera vez, tiene x=0 e y=0, más allá del estilo definido, esto hace que el mapa se cargue en un lugar incorrecto de la pantalla
    //Llamar a al función _onResize() en este momento (cuando ya cargó el HTML, CSS y JS) arregla las dimensiones del mapa
    map._onResize();
}

function radioCencista(){ //recibe radio en kilómetros, radio máximo: 550 KMs (para cubrir todo Uruguay desde cualuier punto).
    kms = document.querySelector("#mapaKms").value;
    if(kms > 0 && kms < 551){
        mts = kms * 1000;
        mapCirculo.setRadius(mts);
    } else {
        tostadora("mensajeMap", "Radio inválido: Debe ser entre 1 y 550 kilómetros.");
    }

    ciudadesEnRadio();
}

//obtener ciudades dentro del radio marcado
function ciudadesEnRadio(){
    let radioCirculo = mapCirculo.getRadius();
    let largo = todasLasCiudades.length;

    marcadoresCiudades.clearLayers(); //limpiamos marcadores del mapa

    for(let i = 0; i < largo; i++){
        let ciudadPos = new L.LatLng(todasLasCiudades[i].latitud, todasLasCiudades[i].longitud); //console.log(ciudadPos);        
        if (ciudadPos.distanceTo(cencistaGPS) < radioCirculo){            
            if( confirmarCiudadCesada(todasLasCiudades[i].id) ){
                //console.log("Sip, censamo' a alguien acá")
                let marcadorCiudad = L.marker(ciudadPos).addTo(map);
                marcadoresCiudades.addLayer(marcadorCiudad);
            }
        }
    }
}

function confirmarCiudadCesada(idCiudad){   
    let resultado = false;
    let largo = personasCensadas.length;
    
    for (let i = 0; i < largo && !resultado; i++){
        if(idCiudad == personasCensadas[i].ciudad){
            resultado = true;
        }
    }
    
    return resultado;
}

function geolocalizar(){
    navigator.geolocation.getCurrentPosition(position => {
        cencistaGPS = [position.coords.latitude, position.coords.longitude];
    });
}

function errorRelogueoNecesario(){
    logoutCencista();
    tostadora("mensajeLogin", "Por favor, vuelva a loguearse");  
}

function tostadora(id, mensaje){
    document.querySelector(`#${id}`).message = mensaje + "";
    document.querySelector(`#${id}`).duration = 5000;
    document.querySelector(`#${id}`).present();
}