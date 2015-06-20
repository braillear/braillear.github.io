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

/* TODO con appcache, los js de las secciones no se cachean...
 * al pedirlas $ les agrega un timestamp /js/braillear.js?_=1432093314606
 * para evitar el cacheo.
 * Para appcache hay que usar # en vez de ? para evitar eso
 */

{
    var self = Braillear;

    // Constantes
    self.P1 = 1;
    self.P2 = 2;
    self.P3 = 4;
    self.P4 = 8;
    self.P5 = 16;
    self.P6 = 32;
    self.SALTO_LINEA = -1;
    self.SALTO_LINEA_CHAR = "\n";
    self.SALTO_LINEA_CHARCODE = self.SALTO_LINEA_CHAR.charCodeAt(0);
    self.INICIO_TABLA_BRAILLE_UNICODE = 0x2800;
    self.INDICADOR_CARACTER_BRAILLE_DESCONOCIDO = "<small>�</small>";
    // Mapa con valores estandar (se completa en archivos de maps)
    self.map = [];
    self.map[self.SALTO_LINEA] = self.SALTO_LINEA_CHAR;
    self.map[0] = " ";
    // Mapa inverso (se inicializa solo)
    var invertedMap = {};
    // Modos de ingreso segun caracteres de comandos ingresados
    self.modoMayuscula = 0;
    self.modoNumerico = 0;
    self.modoNumericoInterrupcion = 0;
    function invertirArray(array) {
        var ret = {};
        ret[ self.SALTO_LINEA_CHAR ] = self.SALTO_LINEA;
        $(array).each(function (key, value) {
            ret[value] = key;
        });
        return ret;
    }

    /**
     * Convierte un string latino (con notación Braillear) en su equivalente braille
     *
     * @param {String} latino
     * @returns {String|self.SALTO_LINEA_CHAR|Window.SALTO_LINEA_CHAR|Braillear.SALTO_LINEA_CHAR}
     */
    function convertirEnBraille(latino) {
        latino = latino.toLowerCase();
        var brailleString = "", largo = latino.length;
        for (var pos = 0; pos < largo; pos++) {
            var caracterLatino = latino.charAt(pos);
            var valorBraille = invertedMap[caracterLatino];
            brailleString = brailleString + self.obtenerCaracterBraille(valorBraille);
        }
        return brailleString;
    }

    /**
     * Convierte un string braille en su equivalente latino con notación Braillear
     * @param {String} braille
     * @returns {String}
     */
    function convertirEnLatino(braille) {
        var latinoString = "", largo = braille.length;
        for (var pos = 0; pos < largo; pos++) {
            var charCode = braille.charCodeAt(pos);
            var valorBraille = (charCode === self.SALTO_LINEA_CHARCODE)
                    ? self.SALTO_LINEA
                    : braille.charCodeAt(pos) - self.INICIO_TABLA_BRAILLE_UNICODE;
            // TODO: obtenerCaracterLatino debería recibir los modos como parámetros
            // así controla el modo adecuado (si tiene que ser mayúscula por ejemplo)
            // los manejaría en esta funcion, sino usar al mismo objeto Braillear...
            latinoString = latinoString + obtenerCaracterLatino(valorBraille);
        }
        return latinoString;
    }


    // Variables propias de la interfaz
    var $valorBraille, $textoBraille, $valorLatino, $textoLatino;
    var $textoBrailleContainer, $textoLatinoContainer;
    var valor;
    var $btnBorrarUltimoCaracter, $btnSaltoLinea, $btnEspacio, $msgSugerenciaFullscreen;
    var fullScreenSugerido = false;
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
    self.obtenerCaracterBraille = function (valor) {
        return valor === self.SALTO_LINEA
                ? self.SALTO_LINEA_CHAR
                : String.fromCharCode(self.INICIO_TABLA_BRAILLE_UNICODE + valor);
    };
    function presiona(btn) {
        var idx = btn.data('idx');
        $(btn).addClass('btn-info');
        presiono[idx] = 1;
        solto[idx] = 0;
        valor = obtenerValor(presiono);
        $valorBraille.text(self.obtenerCaracterBraille(valor));
        $valorLatino.html(obtenerCaracterLatino(valor) || self.INDICADOR_CARACTER_BRAILLE_DESCONOCIDO);
    }
    function presionaBoton() {
        presiona($(this));
    }


    function suelta(btn) {
        var idx = btn.data('idx');
        if (presiono[idx]) {
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
    }
    function sueltaBoton() {
        suelta($(this));
    }


    function aceptarCaracter(valor) {
        var caracterBraille = self.obtenerCaracterBraille(valor);
        var caracterLatino = obtenerCaracterLatino(valor);
        if (caracterLatino === "^") {
            self.modoMayuscula++;
            switch (self.modoMayuscula) {
                case 1:
                    console.log("modo mayúscula simple");
                    break;
                case 2:
                    console.log("modo mayúscula múltiple");
                    break;
                default:
                    self.modoMayuscula = 0;
                    console.log("quito modo mayúscula por abuso de signo");
            }
        } else if (self.modoMayuscula === 1) {
            self.modoMayuscula = 0;
            console.log("finalizo modo mayúscula un caracter");
        } else if (self.modoMayuscula === 2 && caracterLatino === caracterLatino.toLowerCase()) {
            self.modoMayuscula = 0;
            console.log("finalizo modo mayúscula múltiple, limita con: " + caracterLatino);
        }

        if (caracterLatino === "#") {
            self.modoNumerico = 1;
            switch (self.modoNumerico) {
                case 1: // aceptaría denominador pero tambien numerador/ordinal
                    console.log("modo numérico");
                    break;
                default:
                    self.modoNumerico = 0;
                    self.modoNumericoInterrupcion = 0;
                    console.log("quito modo numérico por abuso de signo");
            }
        } else if (self.modoNumerico) {
            if (caracterLatino === "@") {
                self.modoNumericoInterrupcion++;
                self.modoNumerico = 2; // sólo números denominadores/comunes
                console.log("interrumpo modo numérico");
            } else if (self.modoNumericoInterrupcion) {
                self.modoNumericoInterrupcion = 0;
                console.log("reactivo modo numérico");
            } else if (caracterLatino === " " || caracterLatino === self.SALTO_LINEA_CHAR) {
                self.modoNumerico = 0;
                self.modoNumericoInterrupcion = 0;
                console.log("desactivo modo numérico");
            } else if (self.modoNumerico === 1
                    && (
                            (valor & self.P1)
                            || (valor & self.P4)
                            )
                    ) {
                // Mientras acepta numeradores y denominadores/ordinales, como
                // los numeradores corresponden a letras siempre usan al punto
                // 1 o 4.
                // Si ingresa alguno, o una letra, ya no puede usar
                // denominadores/ordinales, a lo sumo esa combinación será
                // interpretada como signo sintáctico/matemático
                self.modoNumerico = 2; // sólo números denominadores/comunes
            }
        }

        var colorLatino = "", titulo = "";
        if (caracterLatino === " ") {        // espacio
            caracterLatino = "&nbsp;";
        } else if (caracterLatino === "^") { // mayús
            if (self.modoMayuscula === 1) {
                titulo = "Modo mayúscula";
                colorLatino = "colorMayus";
            } else {
                titulo = "Modo capital";
                colorLatino = "colorCapital";
            }
        } else if (caracterLatino === "#") { // num
            colorLatino = "colorNum";
            titulo = "Modo numérico";
        } else if (caracterLatino === "@" && self.modoNumerico) { // escape num
            colorLatino = "colorEscapeNum";
            titulo = "Escape modo numérico";
        } else if (caracterLatino === "") {  // no mapeado, desconocido
            caracterLatino = self.INDICADOR_CARACTER_BRAILLE_DESCONOCIDO;
            titulo = "Caracter braille desconocido";
            colorLatino = "colorDesconocido";
        }

        if (titulo) {
            titulo = ' title="' + titulo + '" ';
        }

        if (caracterLatino === self.SALTO_LINEA_CHAR) {
            caracterBraille = caracterLatino = '<span><br/><span class="spanCaracter">&nbsp;</span></span>';
        } else {
            caracterBraille = '<span class="spanCaracter">' + caracterBraille + '</span>';
            caracterLatino = '<span ' + titulo + ' class="spanCaracter ' + colorLatino + '">' + caracterLatino + '</span>';
        }

        $textoBraille.append(caracterBraille);
        $textoLatino.append(caracterLatino);
    }


    function presionaEspacio() {
        $btnEspacio.closest('.btnTeclado').addClass('btn-primary');
    }
    function sueltaEspacio() {
        if (!obtenerValor()) {
            aceptarCaracter(0);
        }
        $btnEspacio.closest('.btnTeclado').removeClass('btn-primary');
    }


    function presionaSaltoLinea() {
        $btnSaltoLinea.closest('.btnTeclado').addClass('btn-success');
    }
    function sueltaSaltoLinea() {
        if (!obtenerValor()) {
            aceptarCaracter(self.SALTO_LINEA);
            $textoBrailleContainer.animate({scrollTop: $textoBraille.height()});
        }
        $btnSaltoLinea.closest('.btnTeclado').removeClass('btn-success');
    }


    function presionaBorrarUltimoCaracter() {
        $btnBorrarUltimoCaracter.closest('.btnTeclado').addClass('btn-danger');
    }
    function sueltaBorrarUltimoCaracter() {
        if (!obtenerValor() && $textoBraille.contents().length > 1) {
            $textoBraille.contents().last().remove();
            $textoLatino.contents().last().remove();
        }
        $btnBorrarUltimoCaracter.closest('.btnTeclado').removeClass('btn-danger');
    }


    function eventoTeclaComandoPresiona(evt) {
        // espacio
        if (evt.which === 32) {
            presionaEspacio();
        }
        // enter
        if (evt.which === 13 && !($msgSugerenciaFullscreen.hasClass("in"))) {
            presionaSaltoLinea();
        }
        // backspace
        if (evt.which === 8) {
            presionaBorrarUltimoCaracter();
            return false; // evito que Chromium vueva para atrás en el historial
        }
        // N/n/escape, con modal abierto
        if ((evt.which === 78 || evt.which === 110 || evt.keyCode === 27) && $msgSugerenciaFullscreen.hasClass("in")) {
            $msgSugerenciaFullscreen.modal('hide');
        }
    }
    function eventoTeclaComandoSuelta(evt) {
        // espacio
        if (evt.which === 32)
            sueltaEspacio();
        // enter
        if (evt.which === 13) {
            if ($msgSugerenciaFullscreen.hasClass("in")) {
                $msgSugerenciaFullscreen.modal('hide');
                toggleFullScreen();
            } else {
                sueltaSaltoLinea();
            }
        }
        // backspace
        if (evt.which === 8)
            sueltaBorrarUltimoCaracter();
        return true;
    }


    /**
     * Procesa el keydown/keyup de las teclas QAZOKM
     *
     * @param {Function} handler
     * @returns {boolean}
     */
    function eventoTecla(handler) {
        return function (evt) {
            if ($msgSugerenciaFullscreen.hasClass("in"))
                return;
            switch (evt.which) {
                case 113:
                case 81:
                    handler($('#btnQ'));
                    break;
                case 97:
                case 65:
                    handler($('#btnA'));
                    break;
                case 122:
                case 90:
                    handler($('#btnZ'));
                    break;
                case 111:
                case 79:
                    handler($('#btnO'));
                    break;
                case 107:
                case 75:
                    handler($('#btnK'));
                    break;
                case 109:
                case 77:
                    handler($('#btnM'));
                    break;
                default:
                    return true; // mantenemos F1..12
            }
            return false; // que no procese más al evento si era una letra
        };
    }


    function limpiarTodo() {
        presiono = [0, 0, 0, 0, 0, 0], solto = [0, 0, 0, 0, 0, 0];
        valor = 0;
        $valorBraille.text('');
        $textoBraille.html('');
        $valorLatino.text('');
        $textoLatino.html('');
        aceptarCaracter(0);
    }


    /**
     * Indica si se está actualmente en modo fullscreen
     *
     * @returns {Boolean}
     */
    function isFullScreen() {
        // return window.fullScreen no? el codigo de MDN usaba esto:
        return (document.fullscreenElement  // alternative standard method
                || document.mozFullScreenElement
                || document.webkitFullscreenElement
                || document.msFullscreenElement
                ) !== undefined;
    }

    /**
     * Indica si el browser soporta alguna de las API's fullscreen que usamos
     * @returns {Boolean}
     */
    function isFullScreenSupported() {
        return (document.documentElement.requestFullscreen
                || document.documentElement.msRequestFullscreen
                || document.documentElement.mozRequestFullScreen
                || document.documentElement.webkitRequestFullscreen
                ) !== undefined;
    }

    /**
     * Activa/desactiva el modo fullscreen.
     * Código adaptado de Mozila Developer Network (MDN)
     */
    function toggleFullScreen() {
        //    fullscreenSugerido = false; //acepto, asi que podemos seguimos sugiriendo
        if (!isFullScreen()) {  // current working methods
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
    }

    function onWindowResize() {
        // tamaño de tipografía "responsive" para indicador de punto braille en botones
        var letraBotonera = $(".btnTeclado .fuenteBraille")[0];
        if (!letraBotonera) {
            return;
        }
        var btnAspectRatio = letraBotonera.clientHeight / letraBotonera.clientWidth;
        var coef = 0.85;
        if (btnAspectRatio > 2) {
            coef = 0.65;
        } else if (btnAspectRatio > 1.8) {
            coef = 0.75;
        }
        var fontSizeBotonera = letraBotonera.clientHeight * coef;
        $(".btnTeclado .fuenteBraille").css({"font-size": fontSizeBotonera + "px"});
        // sugerencia de fullscreen para pantallas pequeñas
        if (isFullScreenSupported()) {
            if (!fullScreenSugerido
                    && !isFullScreen()
                    && window.innerHeight < 405) {
                fullScreenSugerido = true;
                $msgSugerenciaFullscreen.modal({show: true, keyboard: true});
                //        console.log("sugerido");
                //} else { //if ($msgSugerenciaFullscreen.hasClass("in"))
                //        console.log("cancelo sugerencia");
                //            $msgSugerenciaFullscreen.modal('hide');
                //            fullscreenSugerido = false; // ocultamos sugerencia automaticamente, podemos volver a sugerir
            }
        }
    }


    self.inicializarMapas = function () {
        inicializarMapa(self.map);
        invertedMap = invertirArray(self.map);
    };
    /**
     * Inicializa el teclado
     * TODO:.Debería estar en teclado.html, refactorizar este lío.
     * Podría ser:
     *   self.inicializar = function() {...
     * así lo invoca el main.js, pero tenemos dependencias de otros scripts
     */
    self.inicializarTeclado = function () {
        self.inicializarMapas();
        $valorBraille = $('#valorBraille');
        $valorLatino = $('#valorLatino');
        $textoBraille = $('#textoBraille');
        $textoLatino = $('#textoLatino');
        $btnEspacio = $('#btnEspacio');
        $btnSaltoLinea = $('#btnSaltoLinea');
        $btnBorrarUltimoCaracter = $('#btnBorrar');
        $msgSugerenciaFullscreen = $("#msgSugerenciaFullscreen");
        $textoBrailleContainer = $("#textoBrailleContainer");
        $textoLatinoContainer = $("#textoLatinoContainer");
        $textoBrailleContainer.scroll(function () {
            $textoLatinoContainer.scrollTop(this.scrollTop);
            $textoLatinoContainer.scrollLeft(this.scrollLeft);
        });
        $textoLatinoContainer.scroll(function () {
            $textoBrailleContainer.scrollTop(this.scrollTop);
            $textoBrailleContainer.scrollLeft(this.scrollLeft);
        });
        $('.btnBraile')
                .bind('touchstart', presionaBoton)
                .bind('touchend', sueltaBoton);
        $(window)
                .keydown(eventoTecla(presiona))
                .keyup(eventoTecla(suelta))
                .keydown(eventoTeclaComandoPresiona)
                .keyup(eventoTeclaComandoSuelta);
        $btnEspacio.closest('.btnTeclado')
                .bind('touchstart', presionaEspacio)
                .bind('touchend', sueltaEspacio);
        $btnSaltoLinea.closest('.btnTeclado')
                .bind('touchstart', presionaSaltoLinea)
                .bind('touchend', sueltaSaltoLinea);
        $btnBorrarUltimoCaracter.closest('.btnTeclado')
                .bind('touchstart', presionaBorrarUltimoCaracter)
                .bind('touchend', sueltaBorrarUltimoCaracter);
        $('#btnFullscreen').click(toggleFullScreen);
        limpiarTodo();
        fullScreenSugerido = false;
        mostrarInicializables();
        // TODO: seria mejor cuando cambia el orientation (ondeviceorientation existe pero no logro que se invoque), y tal vez no sea multiplataforma
        window.onresize = onWindowResize;
        onWindowResize();
    };
    /**
     * Deshabilita los event handlers de la página y libera los recursos que
     * use.
     */
    self.destruirTeclado = function () {
        $('.btnBraile').unbind();
        $(window).unbind();
        $btnEspacio.unbind();
        $btnSaltoLinea.unbind();
        $btnBorrarUltimoCaracter.unbind();
        $('#btnFullscreen').unbind();
    };
}
