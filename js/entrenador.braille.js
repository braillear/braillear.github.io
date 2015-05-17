// Constantes
var INICIO_TABLA_BRAILLE_UNICODE = 0x2800;
var SALTO_LINEA = -1;
var SALTO_LINEA_CHAR = "\n";
var SALTO_LINEA_CHARCODE = SALTO_LINEA_CHAR.charCodeAt(0);

// Mapa con valores estandar (se completa en archivos de maps)
var map = [];
map[SALTO_LINEA] = SALTO_LINEA_CHAR;
map[0] = " ";
// Mapa inverso (se inicializa solo)
var invertedMap = {};

// Modos de ingreso segun caracteres de comandos ingresados
var modoMayuscula = 0, modoNumerico = 0, modoNumericoInterrupcion = 0;


function invertirArray(array) {
    var ret = {};
    ret[ SALTO_LINEA_CHAR ] = SALTO_LINEA;

    $(array).each(function (key, value) {
        ret[value] = key;
    });

    return ret;
}

function convertirEnBraille(latino) {
    var brailleString = "", largo = latino.length;
    for (var pos = 0; pos < largo; pos++) {
        var caracterLatino = latino.charAt(pos);
        var valorBraille = invertedMap[caracterLatino];
        brailleString = brailleString + obtenerCaracterBraille(valorBraille);
    }
    return brailleString;
}

function convertirEnLatino(braille) {
    var latinoString = "", largo = braille.length;
    for (var pos = 0; pos < largo; pos++) {
        var charCode = braille.charCodeAt(pos);
        var valorBraille = (charCode === SALTO_LINEA_CHARCODE)
                ? SALTO_LINEA
                : braille.charCodeAt(pos) - INICIO_TABLA_BRAILLE_UNICODE;
        latinoString = latinoString + obtenerCaracterLatino(valorBraille);
    }
    return latinoString;
}


// Variables propias de la interfaz
var $valorBraille, $textoBraille, $valorLatino, $textoLatino, valor;
var $btnBorrarUltimoCaracter, $btnSaltoLinea, $btnEspacio;
var fullscreenSugerido = false;

/////////////////////////////////////////////////
// simplificar esto, aunque sea multitouch se procesa
// secuencialmente en JS así que no hay race conditions
// podría usar int nomas, esto fue una prueba y quedó así
var presiono = [0, 0, 0, 0, 0, 0], solto = [0, 0, 0, 0, 0, 0];
function obtenerValor() {
    var resultado = 0;
    for (var i = 0; i < 6; i++) {
        if (presiono[i]) {
            resultado += Math.pow(2, i);
        }
    }
    return resultado;
}

function sumar(array) {
    var resultado = 0;
    for (var i = 0; i < 6; i++)
        resultado += array[i] * Math.pow(2, i);
    return resultado;
}

function iguales(arrayA, arrayB) {
    for (var i = 0; i < 6; i++) {
        if (arrayA[i] !== arrayB[i]) {
            return false;
        }
    }
    return true;
}

function limpiar(arrayA, arrayB) {
    for (var i = 0; i < 6; i++) {
        arrayA[i] = 0;
        arrayB[i] = 0;
    }
}
/////////////////////////////////////////////////

/**
 * Devuelve el caracter Unicode del set Braille (desde \u2800).
 * Uso solo los primeros 64 caracteres, luego siguen de 8 puntos (para japonés/chino).
 *
 * @param {Integer} valor   Código braille del caracter; suma del valor de cada
 * punto activo (punto p1=1, p2=2, p3=4, p4=8, p5=16, p6=32), o valor especial
 * SALTO_LINEA para retorno de carro.
 * @returns {String}        Caracter braille unicode o salto de línea
 */
function obtenerCaracterBraille(valor) {
    return valor === SALTO_LINEA
            ? SALTO_LINEA_CHAR
            : String.fromCharCode(INICIO_TABLA_BRAILLE_UNICODE + valor);
}



function presiona(btn) {
    var idx = btn.data('idx');
    $(btn).addClass('btn-info');
    presiono[idx] = 1;
    solto[idx] = 0;
    valor = obtenerValor(presiono);
    $valorBraille.text(obtenerCaracterBraille(valor));
    $valorLatino.text(obtenerCaracterLatino(valor));
}
function presionaBoton() {
    presiona($(this));
}


function suelta(btn) {
    var idx = btn.data('idx');
    solto[idx] = 1;
    if (iguales(presiono, solto)) {
        aceptarCaracter(valor);
        limpiar(presiono, solto);
        valor = 0;
        $valorBraille.text('');
        $valorLatino.text('');
        $('.btnBraile').removeClass('btn-info');
    }
}
function sueltaBoton() {
    suelta($(this));
}


function aceptarCaracter(valor) {
    var caracterBraille = obtenerCaracterBraille(valor);
    var caracterLatino = obtenerCaracterLatino(valor);

    if (caracterLatino === "^") {
        modoMayuscula++;
        switch (modoMayuscula) {
            case 1:
                console.log("modo mayúscula simple");
                break;
            case 2:
                console.log("modo mayúscula múltiple");
                break;
            default:
                modoMayuscula = 0;
                console.log("quito modo mayúscula por abuso de signo");
        }
    } else if (modoMayuscula === 1) {
        modoMayuscula = 0;
        console.log("finalizo modo mayúscula un caracter");
    } else if (modoMayuscula === 2 && caracterLatino === caracterLatino.toLowerCase()) {
        modoMayuscula = 0;
        console.log("finalizo modo mayúscula múltiple, limita con: " + caracterLatino);
    }

    if (caracterLatino === "#") {
        modoNumerico++;
        switch (modoNumerico) {
            case 1:
                console.log("modo numérico");
                break;
            default:
                modoNumerico = 0;
                modoNumericoInterrupcion = 0;
                console.log("quito modo numérico por abuso de signo");
        }
    } else if (modoNumerico) {
        if (caracterLatino === "@") {
            modoNumericoInterrupcion++;
            console.log("interrumpo modo numérico");
        } else if (modoNumericoInterrupcion) {
            modoNumericoInterrupcion = 0;
            console.log("reactivo modo numérico");
        } else if (caracterLatino === " " || caracterLatino === SALTO_LINEA_CHAR) {
            modoNumerico = 0;
            modoNumericoInterrupcion = 0;
            console.log("desactivo modo numérico");
        }
    }

    var colorLatino = "", titulo = "";
    if (caracterLatino === " ") {        // espacio
        caracterLatino = "&nbsp;";
    } else if (caracterLatino === "^") { // mayús
        if (modoMayuscula === 1) {
            titulo = "Modo mayúscula";
            colorLatino = "colorMayus";
        } else {
            titulo = "Modo capital";
            colorLatino = "colorCapital";
        }
    } else if (caracterLatino === "#") { // num
        colorLatino = "colorNum";
        titulo = "Modo numérico";
    } else if (caracterLatino === "@" && modoNumerico) { // escape num
        colorLatino = "colorEscapeNum";
        titulo = "Escape modo numérico";
    } else if (caracterLatino === "") {  // no mapeado, desconocido
        caracterLatino = "?";
        titulo = "Caracter braille desconocido";
        colorLatino = "colorDesconocido";
    }

    if (titulo) {
        titulo = ' title="' + titulo + '" ';
    }

    if (caracterLatino === SALTO_LINEA_CHAR) {
        caracterBraille = caracterLatino = '<span><br/><span class="spanCaracter">&nbsp;</span></span>';
    } else {
        caracterBraille = '<span class="spanCaracter">' + caracterBraille + '</span>';
        caracterLatino = '<span ' + titulo + ' class="spanCaracter ' + colorLatino + '">' + caracterLatino + '</span>';
    }

    $textoBraille.append(caracterBraille);
    $textoLatino.append(caracterLatino);
}


function presionaEspacio() {
    $btnEspacio.addClass('btn-primary');
}
function sueltaEspacio() {
    if (!obtenerValor()) {
        aceptarCaracter(0);
    }
    $btnEspacio.removeClass('btn-primary');
}


function presionaSaltoLinea() {
    $btnSaltoLinea.addClass('btn-success');
}
function sueltaSaltoLinea() {
    if (!obtenerValor()) {
        aceptarCaracter(SALTO_LINEA);
        //TODO: podría enlazar el handler scroll de uno e invocar al otro? para mantenerlo siempre sinc.
        $('#textoBrailleContainer').animate({scrollTop: $textoBraille.height()});
        $('#textoLatinoContainer').animate({scrollTop: $textoLatino.height()});
    }
    $btnSaltoLinea.removeClass('btn-success');
}



function presionaBorrarUltimoCaracter() {
    $btnBorrarUltimoCaracter.addClass('btn-danger');
}
function sueltaBorrarUltimoCaracter() {
    if (!obtenerValor() && $textoBraille.contents().length > 1) {
        $textoBraille.contents().last().remove();
        $textoLatino.contents().last().remove();
    }
    $btnBorrarUltimoCaracter.removeClass('btn-danger');
}


function eventoTeclaComandoPresiona(evt) {
    if (evt.key === " ")
        presionaEspacio();
    if (evt.keyCode === 13)
        presionaSaltoLinea();
    if (evt.keyCode === 8)
        presionaBorrarUltimoCaracter();
}
function eventoTeclaComandoSuelta(evt) {
    if (evt.key === " ")
        sueltaEspacio();
    if (evt.keyCode === 13)
        sueltaSaltoLinea();
    if (evt.keyCode === 8)
        sueltaBorrarUltimoCaracter();
}


function eventoTecla(handler) {
    return function (e) {
        if (!e.key)
            return;
        switch (e.key) {
            case "Q":
            case "q":
                handler($('#btnQ'));
                break;
            case "A":
            case "a":
                handler($('#btnA'));
                break;
            case "Z":
            case "z":
                handler($('#btnZ'));
                break;
            case "O":
            case "o":
                handler($('#btnO'));
                break;
            case "K":
            case "k":
                handler($('#btnK'));
                break;
            case "M":
            case "m":
                handler($('#btnM'));
                break;
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


function checkPantallasMinimas() {
//    console.log(window.innerHeight, $("#msgSugerenciaFullscreen").attr('class'));
    if (!fullscreenSugerido
            && !window.fullScreen
            && window.innerHeight < 405) {
        fullscreenSugerido = true;
        $("#msgSugerenciaFullscreen").modal('show');
//        console.log("sugerido");
//    } else { //if ($("#msgSugerenciaFullscreen").hasClass("in"))
//        console.log("cancelo sugerencia");
//        $("#msgSugerenciaFullscreen").modal('hide');
//        fullscreenSugerido = false; // ocultamos sugerencia automaticamente, podemos volver a sugerir
    }
}

/**
 * Activa/desactiva el modo fullscreen.
 * Código obtenido de Mozila Developer Network (MDN)
 */
function toggleFullScreen() {
//    fullscreenSugerido = false; //acepto, asi que podemos seguimos sugiriendo
    if (!document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
    return true;
}


$(function () {
    inicializarMapa(map);
    invertedMap = invertirArray(map);

    $valorBraille = $('#valorBraille');
    $valorLatino = $('#valorLatino');
    $textoBraille = $('#textoBraille');
    $textoLatino = $('#textoLatino');

    $btnEspacio = $('#btnEspacio');
    $btnSaltoLinea = $('#btnSaltoLinea');
    $btnBorrarUltimoCaracter = $('#btnBorrar');
    //$('#btnLimpiar').click(limpiarTodo);

    $.each($('.btnBraile'), function (idx, btn) {
        btn.addEventListener('touchstart', presionaBoton, false);
        btn.addEventListener('touchend', sueltaBoton, false);
    });
    $(window).keydown(eventoTecla(presiona));
    $(window).keyup(eventoTecla(suelta));
    $(window).keydown(eventoTeclaComandoPresiona);
    $(window).keyup(eventoTeclaComandoSuelta);

    $btnEspacio.bind('touchstart', presionaEspacio);
    $btnEspacio.bind('touchend', sueltaEspacio);
    $btnSaltoLinea.bind('touchstart', presionaSaltoLinea);
    $btnSaltoLinea.bind('touchend', sueltaSaltoLinea);
    $btnBorrarUltimoCaracter.bind('touchstart', presionaBorrarUltimoCaracter);
    $btnBorrarUltimoCaracter.bind('touchend', sueltaBorrarUltimoCaracter);

    limpiarTodo();
    aceptarCaracter(0);

    $("#msgSugerenciaFullscreen").hide(); // TODO: ver modales en btsp, esto no deberia ser necesario (sin esto no se ve, pero bloquea los clicks
    $('#btnFullscreen').click(toggleFullScreen);
    fullscreenSugerido = false;
    window.onresize = checkPantallasMinimas; // TODO: seria mejor cuando cambia el orientation (ondeviceorientation existe pero no logro que se invoque), y tal vez no sea multiplataforma
    checkPantallasMinimas();

    $('.inicializable').hide().removeClass("inicializable").addClass("inicializado").fadeIn("slow");
    $('#msgCargando').fadeOut("slow");
});
