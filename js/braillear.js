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

{
    var self = Braillear;

    // Constantes
    self.INICIO_TABLA_BRAILLE_UNICODE = 0x2800;
    self.SALTO_LINEA = -1;
    self.SALTO_LINEA_CHAR = "\n";
    self.SALTO_LINEA_CHARCODE = self.SALTO_LINEA_CHAR.charCodeAt(0);

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

    function convertirEnBraille(latino) {
        var brailleString = "", largo = latino.length;
        for (var pos = 0; pos < largo; pos++) {
            var caracterLatino = latino.charAt(pos);
            var valorBraille = invertedMap[caracterLatino];
            brailleString = brailleString + self.obtenerCaracterBraille(valorBraille);
        }
        return brailleString;
    }

    function convertirEnLatino(braille) {
        var latinoString = "", largo = braille.length;
        for (var pos = 0; pos < largo; pos++) {
            var charCode = braille.charCodeAt(pos);
            var valorBraille = (charCode === self.SALTO_LINEA_CHARCODE)
                    ? self.SALTO_LINEA
                    : braille.charCodeAt(pos) - self.INICIO_TABLA_BRAILLE_UNICODE;
            latinoString = latinoString + obtenerCaracterLatino(valorBraille);
        }
        return latinoString;
    }


    // Variables propias de la interfaz
    var $valorBraille, $textoBraille, $valorLatino, $textoLatino, valor;
    var $btnBorrarUltimoCaracter, $btnSaltoLinea, $btnEspacio;
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
    }



    function presiona(btn) {
        var idx = btn.data('idx');
        $(btn).addClass('btn-info');
        presiono[idx] = 1;
        solto[idx] = 0;
        valor = obtenerValor(presiono);
        $valorBraille.text(self.obtenerCaracterBraille(valor));
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
            self.modoNumerico++;
            switch (self.modoNumerico) {
                case 1:
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
                console.log("interrumpo modo numérico");
            } else if (self.modoNumericoInterrupcion) {
                self.modoNumericoInterrupcion = 0;
                console.log("reactivo modo numérico");
            } else if (caracterLatino === " " || caracterLatino === SALTO_LINEA_CHAR) {
                self.modoNumerico = 0;
                self.modoNumericoInterrupcion = 0;
                console.log("desactivo modo numérico");
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
            caracterLatino = "?";
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
            aceptarCaracter(self.SALTO_LINEA);
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
            console.log("esta en fs");
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                console.log("pido fs")
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            console.log("NO esta en fs");
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
                $("#msgSugerenciaFullscreen").modal('show');
                //        console.log("sugerido");
                //} else { //if ($("#msgSugerenciaFullscreen").hasClass("in"))
                //        console.log("cancelo sugerencia");
                //            $("#msgSugerenciaFullscreen").modal('hide');
                //            fullscreenSugerido = false; // ocultamos sugerencia automaticamente, podemos volver a sugerir
            }
        }
    }


    self.inicializar = function () {
        inicializarMapa(self.map);
        invertedMap = invertirArray(self.map);

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

        $('#btnFullscreen').click(toggleFullScreen);
        fullScreenSugerido = false;

        mostrarInicializables();
        // TODO: seria mejor cuando cambia el orientation (ondeviceorientation existe pero no logro que se invoque), y tal vez no sea multiplataforma
        window.onresize = onWindowResize;
        onWindowResize();
    };


    self.destruir = function () {
        $('.btnBraile').unbind();
        $(window).unbind();
        $btnEspacio.unbind();
        $btnSaltoLinea.unbind();
        $btnBorrarUltimoCaracter.unbind();
        $('#btnFullscreen').unbind();
    };
}