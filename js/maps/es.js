/*
 * Copyright (C) 2015 Lucas Capalbo Lavezzo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Inicializa el mapeo de valores (suma del valor de los puntos braille p1..p6
 * como binario 1..32) al caracter latino equivalente.
 *
 * @param {Array} map   Mapa valor braille->caracter latino inicial.
 */
function inicializarMapa(map) {
    // comandos
    // modo mayúscula, puntos 46
    map[Braillear.P4 + Braillear.P6] = "^";
    // modo numérico, puntos 3456
    map[Braillear.P3 + Braillear.P4 + Braillear.P5 + Braillear.P6] = "#";
    // interrupción de modo numérico por un único caracter, punto 5
    map[Braillear.P5] = "@";

    // Abecedario
    map[Braillear.P1] = "a";
    map[Braillear.P1 + Braillear.P2] = "b";
    map[Braillear.P1 + Braillear.P4] = "c";
    map[Braillear.P1 + Braillear.P4 + Braillear.P5] = "d";
    map[Braillear.P1 + Braillear.P5] = "e";
    map[Braillear.P1 + Braillear.P2 + Braillear.P4] = "f";
    map[Braillear.P1 + Braillear.P2 + Braillear.P4 + Braillear.P5] = "g";
    map[Braillear.P1 + Braillear.P2 + Braillear.P5] = "h";
    map[Braillear.P2 + Braillear.P4] = "i";
    map[Braillear.P2 + Braillear.P4 + Braillear.P5] = "j";
    map[Braillear.P1 + Braillear.P3] = "k";
    map[Braillear.P1 + Braillear.P2 + Braillear.P3] = "l";
    map[Braillear.P1 + Braillear.P3 + Braillear.P4] = "m";
    map[Braillear.P1 + Braillear.P3 + Braillear.P4 + Braillear.P5] = "n";
    map[Braillear.P1 + Braillear.P2 + Braillear.P4 + Braillear.P5 + Braillear.P6] = "ñ";
    map[Braillear.P1 + Braillear.P3 + Braillear.P5] = "o";
    map[Braillear.P1 + Braillear.P2 + Braillear.P3 + Braillear.P4] = "p";
    map[Braillear.P1 + Braillear.P2 + Braillear.P3 + Braillear.P4 + Braillear.P5] = "q";
    map[Braillear.P1 + Braillear.P2 + Braillear.P3 + Braillear.P5] = "r";
    map[Braillear.P2 + Braillear.P3 + Braillear.P4] = "s";
    map[Braillear.P2 + Braillear.P3 + Braillear.P4 + Braillear.P5] = "t";
    map[Braillear.P1 + Braillear.P3 + Braillear.P6] = "u";
    map[Braillear.P1 + Braillear.P2 + Braillear.P3 + Braillear.P6] = "v";
    map[Braillear.P2 + Braillear.P4 + Braillear.P5 + Braillear.P6] = "w";
    map[Braillear.P1 + Braillear.P3 + Braillear.P4 + Braillear.P6] = "x";
    map[Braillear.P1 + Braillear.P3 + Braillear.P4 + Braillear.P5 + Braillear.P6] = "y";
    map[Braillear.P1 + Braillear.P3 + Braillear.P5 + Braillear.P6] = "z";

    // Acentos
    // TODO: resolver: á coincide con [
    map[Braillear.P1 + Braillear.P2 + Braillear.P3 + Braillear.P5 + Braillear.P6] = "á";
    map[Braillear.P2 + Braillear.P3 + Braillear.P4 + Braillear.P6] = "é";
    map[Braillear.P3 + Braillear.P4] = "í";
    map[Braillear.P3 + Braillear.P4 + Braillear.P6] = "ó";
    // TODO: resolver: ú coincide ]
    map[Braillear.P2 + Braillear.P3 + Braillear.P4 + Braillear.P5 + Braillear.P6] = "ú";
    map[Braillear.P1 + Braillear.P2 + Braillear.P5 + Braillear.P6] = "ü";

    // Signos ortográficos
    map[Braillear.P3] = ".";
    map[Braillear.P2] = ",";
    map[Braillear.P2 + Braillear.P3] = ";";
    map[Braillear.P2 + Braillear.P5] = ":";
    map[Braillear.P1 + Braillear.P2 + Braillear.P6] = "(";
    map[Braillear.P3 + Braillear.P4 + Braillear.P5] = ")";
    map[Braillear.P1 + Braillear.P2 + Braillear.P3 + Braillear.P5 + Braillear.P6] = "[";
    map[Braillear.P2 + Braillear.P3 + Braillear.P4 + Braillear.P5 + Braillear.P6] = "]";
    map[Braillear.P3 + Braillear.P6] = "-";
    // TODO: El * también se usa como apertura y cierre de enfasis, para texto
    // subrayado, negrita o itálica. No sé como diferencian.
    // El multiplicar es otro signo.
    map[Braillear.P3 + Braillear.P5] = "*";
    // TODO: signos emparejados, apertura y cierre
    map[Braillear.P2 + Braillear.P6] = "¿?";
    map[Braillear.P2 + Braillear.P3 + Braillear.P5] = "¡!";
    map[Braillear.P2 + Braillear.P3 + Braillear.P6] = "“”";


    // TODO: completar signos matemáticos y otros
    // * arroba es escape de modo numérico, ya conf. arriba
    // * numeral solo es indicador de modo numérico. El numeral braille es
    // combinación #@ (TODO incluir soporte, #@a sería #a, no a ni 1)
}


/**
 * Devuelve el caracter latino asociado al código braille, según el modo de
 * entrada actual.
 *
 * @param {Integer} valor   Codigo braille del caracter
 * @returns {String}        Caracter latino asociado
 */
function obtenerCaracterLatino(valor) {
    var caracter = Braillear.map[valor] || "";

    if (Braillear.modoMayuscula) {
        caracter = caracter.toUpperCase();
    }

    if (Braillear.modoNumerico && !Braillear.modoNumericoInterrupcion) {
        if (caracter === "j") {
            caracter = "0";
        } else if (caracter >= "a" && caracter < "j") {
            caracter = String.fromCharCode("1".charCodeAt(0) + caracter.charCodeAt(0) - "a".charCodeAt(0));
        }
    }

    return caracter;
}
;