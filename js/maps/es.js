/**
 * Inicializa el mapeo de valores (suma del valor de los puntos braille p1..p6
 * como binario 1..32) al caracter latino equivalente.
 *
 * @param array map Mapa valor braille->caracter latino inicial.
 */
function inicializarMapa(map) {
    // comandos
    // modo mayúscula, puntos 46
    map[40] = "^";
    // modo numérico, puntos 3456
    map[60] = "#";
    // interrupción de modo numérico por un único caracter, punto 5
    map[16] = "@";

    // abecedario
    map[1] = "a";
    map[3] = "b";
    map[9] = "c";
    map[25] = "d";
    map[17] = "e";
    map[11] = "f";
    map[27] = "g";
    map[19] = "h";
    map[10] = "i";
    map[26] = "j";
    map[5] = "k";
    map[7] = "l";
    map[13] = "m";
    map[29] = "n";
    map[21] = "o";
    map[15] = "p";
    map[31] = "q";
    map[23] = "r";
    map[14] = "s";
    map[30] = "t";
    map[37] = "u";
    map[39] = "v";
    map[58] = "w";
    map[45] = "x";
    map[59] = "y";
    map[53] = "z";

    // acentos y letras español
    map[55] = "á";
    map[46] = "é";
    map[12] = "í";
    map[44] = "ó";
    map[62] = "ú";
    map[51] = "ü";
    map[59] = "ñ";

    // signos ortograficos
    map[4] = ".";
    map[2] = ",";
    map[6] = ";";
    map[18] = ":";
    map[35] = "(";
    map[28] = ")";
    map[55] = "[";
    map[62] = "]";
    map[36] = "-";
    map[20] = "*";  // TODO: * también se usa como apertura y cierre de enfasis, para texto subrayado, negrita o itálica. No sé como diferencian. El multiplicar es otro signo

    // TODO: signos emparejados, apertura y cierre
    //case 34: caracter = "¿ ?";
    //case 21: caracter = "¡ !";
    //case 38: caracter = "“ ”";

    // TODO: completar signos matemáticos y otros
    // * arroba es escape de modo numérico, ya conf. arriba
    // * numeral solo es indicador de modo numérico. El numeral braille es
    // combinación #@ (TODO incluir soporte, #@a sería #a, no a ni 1)
}


/**
 * Devuelve el caracter latino asociado al código braille, según el modo de
 * entrada actual.
 */
function obtenerCaracterLatino(valor) {
    var caracter = map[valor] || "";

    if (modoMayuscula) {
        caracter = caracter.toUpperCase();
    }

    if (modoNumerico && !modoNumericoInterrupcion) {
        if (caracter === "j") {
            caracter = "0";
        } else if (caracter >= "a" && caracter < "j") {
            caracter = String.fromCharCode("1".charCodeAt(0) + caracter.charCodeAt(0) - "a".charCodeAt(0));
        }
    }

    return caracter;
}