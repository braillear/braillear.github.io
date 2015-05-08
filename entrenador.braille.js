var SALTO_LINEA=-1;
var ESPACIO_BRAILLE = '<span class="fuenteLatina">&nbsp;</span>';
var ENTER = '<span><br/>' + ESPACIO_BRAILLE + '</span>';

var presiono = [0,0,0,0,0,0], solto = [0,0,0,0,0,0];
var $valorBraille, $textoBraille, $valorLatino, $textoLatino, valor;
var modoMayuscula=0, modoNumerico=0, modoNumericoInterrupcion=0;

function obtenerValor(){
    var resultado=0;
    for(var i=0; i<6; i++) {
        if(presiono[i]) {
           resultado += Math.pow(2,i);
        }
    }
    return resultado;
}

function sumar(array){
    var resultado=0;
    for(var i=0; i<6; i++) resultado += array[i] * Math.pow(2,i);
    return resultado;
}

function iguales(arrayA, arrayB) {
    for(var i=0; i<6; i++) {
        if(arrayA[i] != arrayB[i]) {
            return false;
        }
    }
    return true;
}

function limpiar(arrayA, arrayB) {
    for(var i=0; i<6; i++) {
        arrayA[i] = 0;
        arrayB[i] = 0;
    }
}


function obtenerCaracterBraille(codigo) {
    //Usando unicode que andaría genial: return String.fromCharCode(10240 + codigo);
    var caracter = "";
    switch(codigo){    
        // comandos
        case SALTO_LINEA: caracter = "\n"; break;
        case 0: caracter = " "; break;
        
        // letras
        case 1: caracter = "a"; break;
        case 3: caracter = "b"; break;
        case 9: caracter = "c"; break;
        case 25: caracter = "d"; break;
        case 17: caracter = "e"; break;
        case 11: caracter = "f"; break;
        case 27: caracter = "g"; break;
        case 19: caracter = "h"; break;
        case 10: caracter = "i"; break;
        case 26: caracter = "j"; break;
        case 5: caracter = "k"; break;
        case 7: caracter = "l"; break;
        case 13: caracter = "m"; break;
        case 29: caracter = "n"; break;
        case 59: caracter = "ñ"; break;
        case 21: caracter = "o"; break;
        case 15: caracter = "p"; break;
        case 31: caracter = "q"; break;
        case 23: caracter = "r"; break;
        case 14: caracter = "s"; break;
        case 30: caracter = "t"; break;
        case 37: caracter = "u"; break;
        case 39: caracter = "v"; break;
        case 58: caracter = "w"; break;
        case 45: caracter = "x"; break;
        case 59: caracter = "y"; break;
        case 53: caracter = "z"; break;
        case 55: caracter = "á"; break;
        case 46: caracter = "é"; break;
        case 12: caracter = "í"; break;
        case 44: caracter = "ó"; break;
        case 62: caracter = "ú"; break;
        case 51: caracter = "ü"; break;

        // modo mayúscula, puntos 46
        case 40: caracter = "½"; break;
        // modo numérico, puntos 3456
        case 60: caracter = "#"; break;
        // interrupción de modo numérico por un único caracter, punto 5
        case 16: caracter = "~"; break;
        
        // signos ortograficos 
        case 4: caracter = "."; break;
        case 2: caracter = ","; break;
        case 6: caracter = ";"; break;
        case 18: caracter = ":"; break;
        case 35: caracter = "("; break;
        case 28: caracter = ")"; break;
        case 55: caracter = "["; break;
        case 62: caracter = "]"; break;
        case 36: caracter = "-"; break;
        case 20: caracter = "*"; break;

        // signos emparejados, apertura y cierre
        //case 34: caracter = "¿ ?"; break;
        //case 21: caracter = "¡ !"; break;
        //case 38: caracter = "“ ”"; break;
    }
    return caracter
}


function obtenerCaracterLatino(codigo) {
    var caracter = obtenerCaracterBraille(codigo);

    if(caracter == "  ") {
        caracter = " ";
    }
    
    if(modoMayuscula) {
        caracter = caracter.toUpperCase();
    }

    if(modoNumerico && !modoNumericoInterrupcion) {
        if(caracter == "j") {
            caracter = "0";
        } else if(caracter>="a" && caracter<"j") {
            caracter = String.fromCharCode("1".charCodeAt(0) + caracter.charCodeAt(0) - "a".charCodeAt(0));
        }
    }
    return caracter;
}



function presiona(btn) {
    var idx = btn.data('idx');
    presiono[idx] = 1;
    solto[idx] = 0;
    valor = obtenerValor(presiono);
    $valorBraille.text(obtenerCaracterBraille(valor));
    $valorLatino.text(obtenerCaracterLatino(valor));
}
function presionaBoton(evt) {
    presiona($(this));
}


function aceptarCaracter(valor) {
    var caracterBraille = obtenerCaracterBraille(valor);
    var caracterLatino = obtenerCaracterLatino(valor);

    if(caracterLatino == "½") {
        modoMayuscula++;
        switch(modoMayuscula) {
            case 1: console.log("modo mayuscula simple"); break;
            case 2: console.log("modo mayuscula múltiple"); break;
            default: 
                modoMayuscula=0; 
                console.log("quito modo mayuscula por abuso de signo");
        }
    } else if(modoMayuscula == 1) {
        modoMayuscula=0;
        console.log("finalizo modo mayuscula un caracter");
    } else if(modoMayuscula == 2 && caracterLatino == caracterLatino.toLowerCase()) {
        modoMayuscula=0;
        console.log("finalizo modo mayuscula multiple, limita con: " + caracterLatino);
    }
    
    if(caracterLatino == "#") {
        modoNumerico++;
        switch(modoNumerico) {
            case 1: console.log("modo numérico"); break;
            default: 
                modoNumerico=0; 
                modoNumericoInterrupcion=0;
                console.log("quito modo numérico por abuso de signo");
        }
    } else if(modoNumerico) {    
        if(caracterLatino == "~") {    
            modoNumericoInterrupcion++
            console.log("interrumpo modo numérico");
        } else if(modoNumericoInterrupcion) {
            modoNumericoInterrupcion=0;
            console.log("reactivo modo numérico");
        } else if(caracterLatino == " " || caracterLatino == "\n") {
            modoNumerico=0;
            modoNumericoInterrupcion=0;
            console.log("desactivo modo numérico");
        }
    }
    
    if(caracterBraille == " ") {
        caracterLatino = caracterBraille = ESPACIO_BRAILLE;
    } else if(caracterBraille == "\n") {
        caracterBraille = caracterLatino = ENTER;
    }
    
    $textoBraille.append(caracterBraille);
    $textoLatino.append(caracterLatino);
}


function suelta(btn) {
    var idx = btn.data('idx');
    solto[idx] = 1;
    if(iguales(presiono, solto)) {
        aceptarCaracter(valor);
        limpiar(presiono, solto);
        valor=0;
        $valorBraille.text('');
        $valorLatino.text('');
    }
}
function sueltaBoton(evt) {
    suelta($(this))
}


function agregaEspacio() {
    if(!obtenerValor()) {
        aceptarCaracter(0);
    }
}


function agregaSaltoLinea() {
    if(!obtenerValor()){
        aceptarCaracter(SALTO_LINEA);
        $('#textoBrailleContainer').animate({ scrollTop: $textoBraille.height() });
        $('#textoLatinoContainer').animate({ scrollTop: $textoLatino.height() });
    }
}


function borrarUltimoCaracter() {
    if(!obtenerValor() && $textoBraille.contents().length>1) {        
        $textoBraille.contents().last().remove();
        $textoLatino.contents().last().remove();
    }
}


function eventoTeclaComando(evt) {
    if(obtenerValor()) return;
    if(evt.key == " ") agregaEspacio();
    if(evt.keyCode == 13) agregaSaltoLinea();
    if(evt.keyCode == 8) borrarUltimoCaracter();
}


function eventoTecla(handler) {
    return function(e) {
        if(!e.key) return;
        switch (e.key) {
            case "Q": case "q": handler($('#btnQ')); break;
            case "A": case "a": handler($('#btnA')); break;
            case "Z": case "z": handler($('#btnZ')); break;
            case "O": case "o": handler($('#btnO')); break;
            case "K": case "k": handler($('#btnK')); break;
            case "M": case "m": handler($('#btnM')); break;
            break;
        }
        return;
    }
}


function limpiarTodo() {
    valor = 0;
    $valorBraille.text('');
    $textoBraille.html('');
    $valorLatino.text('');
    $textoLatino.html('');
}


$(function() {
    $valorBraille = $('#valorBraille');
    $valorLatino = $('#valorLatino');
    $textoBraille = $('#textoBraille');
    $textoLatino = $('#textoLatino');
    limpiarTodo();
    
    $(window).keydown(eventoTecla(presiona));
    $(window).keyup(eventoTecla(suelta));
    $.each($('.btnBraile'), function(idx, btn){
        btn.addEventListener('touchstart', presionaBoton, false);
        btn.addEventListener('touchend', sueltaBoton, false);
    });
    
    $(window).keyup(eventoTeclaComando);
    $('#btnEspacio').click(agregaEspacio);
    $('#btnSaltoLinea').click(agregaSaltoLinea);
    $('#btnBorrar').click(borrarUltimoCaracter);
//    $('#btnLimpiar').click(limpiarTodo);
    aceptarCaracter(0);
});
