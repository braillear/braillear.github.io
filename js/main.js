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

var $loader, $contenedor;
var appCache, hayActualizacionPendiente = false, timerAutoRefresh;
Braillear = null;

/**
 * Muestra los elementos con señalados con clase inicializable
 *
 * @param {jQuery} $padre   Opcional. Elemento desde el cual buscar
 *                          inicializables.
 * @returns {jQuery}        Elementos inicializados.
 */
function mostrarInicializables($padre) {
    $padre = $padre || $(document);
    $padre.find('.inicializable').hide().removeClass("inicializable").addClass("inicializado").fadeIn("slow");
}

/**
 * Muestra un mensaje de error genérico y permanece reintentando cargar.
 *
 * @param {String} nombrePagina
 * @param {String} tituloPagina
 * @returns {undefined}
 */
function mostrarError(nombrePagina, tituloPagina) {
    $contenedor.html("\
                <div class=\"container alert alert-danger\" style=\"margin-top: 2em;\">\
                    <p><big><strong>Upps!!!</strong> Parece que algo salió mal...</big></p> \
                    <ul>\
                        <li>La página no existe o no está disponible. Intenta <a href=\"javascript: location.reload()\" title=\"Refresca la página en tu navegador\">actualizar</a>.</li>\
                        <li>Asegúrate de tener conexión;  Braillear se actualizará automáticamente.</li>\
                        <li>Intenta acceder a otras opciones del menú.</li>\
                    </ul>\
                    <p>Si llegaste aquí por medio de un link en Braillear y el problema persiste, <a href = \"mailto:braillear@openmailbox.org\" title=\"Escríbenos un email\">avísanos</a> para que podamos solucionarlo.</p>\
                </div>");
    timerAutoRefresh = setTimeout(function () {
        cargarPagina(nombrePagina, tituloPagina);
    }, 30 * 1000);
}

/**
 * Handler, se ejecuta cuando hay una nueva versión de Braillear disponible
 * @returns {undefined}
 */
function onUpdateReady() {
    hayActualizacionPendiente = (appCache.status === appCache.UPDATEREADY);
    console.log(hayActualizacionPendiente
            ? 'Actualización pendiente detectada.'
            : 'No hay actualizaciones pendientes.');
}
function onCheckingUpdate() {
    console.log('Verificando actualizaciones..');
}
function onCacheUpgradeError(a) {
    console.warn('Error al verificar actualizaciones', a);
}

/**
 * Devuelve la posición del # en la URL actual
 * @returns {Number}
 */
function obtenerPosicionComienzoNombrePagina() {
    return document.URL.lastIndexOf("#");
}

/**
 * Devuelve el nombre de página actual, por defecto #portada
 * @returns {String}
 */
function obtenerNombrePaginaActual() {
    var posComienzoNombrePagina = obtenerPosicionComienzoNombrePagina();
    return posComienzoNombrePagina > 0 ? document.URL.substring(posComienzoNombrePagina) : "#portada";
}

/**
 * Devuelve la URL completa a la página indicada, #portada por defecto
 *
 * @param {String} pagina
 * @returns {Node.URL|Document.URL|document.URL|String}
 */
function obtenerURLPagina(pagina) {
    if (!pagina) {
        pagina = "#portada";
    } else if (pagina[0] !== '#') {
        pagina = '#' + pagina;
    }

    var posComienzoNombrePagina = obtenerPosicionComienzoNombrePagina();
    return (posComienzoNombrePagina <= 0 ? document.URL : document.URL.substring(0, posComienzoNombrePagina))
            + pagina;
}

/**
 * Carga una página en el $contenedor del app.
 * Muestra el $loader temporalmente. Los metodos destruir() e inicializar() de
 * Braillear son invocados antes y despues de la carga, si existen y es exitosa.
 *
 * @param {String} nombrePagina     Nombre de la página a cargar. Ej: "#faq"
 * @param {String} tituloPagina     Título de la página, Ej: "F.A.Q."
 */
function cargarPagina(nombrePagina, tituloPagina) {
    if (timerAutoRefresh) {
        timerAutoRefresh = clearTimeout(timerAutoRefresh);
    }

    if (hayActualizacionPendiente) {
        appCache.swapCache();
        window.location = obtenerURLPagina(nombrePagina);
        window.location.reload();
    }

    var nombrePaginaReal = "";
    if (nombrePagina) {
        nombrePaginaReal = nombrePagina = nombrePagina.substring(1);
    }

    $('ul.navbar-nav li').closest("li").removeClass("active");
    $contenedor.hide();
    if (Braillear && Braillear.destruir) {
        Braillear.destruir();
    }
    Braillear = {};
    $contenedor.text('');

    tituloPagina = tituloPagina || nombrePagina || "Braillear";
    $("#tituloPagina").text(tituloPagina);
    $loader.fadeIn("fast", function () {
        $.ajax({
            url: nombrePaginaReal + ".html",
            type: 'GET',
            cache: true, // Braillear funciona como offline single page application
            async: true}
        ).done(function (template) {
            $contenedor.html(template);
        }).fail(function () {
            mostrarError('#' + nombrePagina, tituloPagina);
        }).always(function () {
            $('ul.navbar-nav li a[href=#' + nombrePagina + ']').closest("li").addClass("active");
            $contenedor.fadeIn("fast", function () {
                $loader.fadeOut("fast");
                if (Braillear.inicializar) {
                    Braillear.inicializar();
                }
            });
        });
    });

    return true;
}

/**
 * Carga un script dinámicamente permitiendo su cacheo
 * (para poder usarlo offline)
 *
 * @param {String} nombreScript
 * @returns {jqXHR}
 */
function cargarScriptCacheado(nombreScript) {
    return $.ajax({
        url: nombreScript,
        dataType: 'script',
        type: 'GET',
        cache: true, // Braillear funciona como offline single page application
        async: true
    });
}

$(function () {
    console.log('* Bienvenido a Braillear.');
    if ($('html').attr('manifest')) {
        appCache = window.applicationCache;
        appCache.addEventListener('updateready', onUpdateReady);
        appCache.addEventListener('checking', onCheckingUpdate);
        appCache.addEventListener('error', onCacheUpgradeError);
        appCache.update();
    } else {
        console.warn('* Cache offline deshabilitado.');
    }

    $loader = $("#msgCargando");
    $contenedor = $('#contenedor');

    $("ul.navbar-nav li a[href^=#], .navbar-header a").click(function () {
        cargarPagina($(this).attr("href"), $(this).text());
        if ($('.navbar-toggle[data-target="#braillear-navbar"][aria-expanded=true]').length) {
            $('#braillear-navbar').collapse('toggle');
        }
    }).keypress(function () {
        this.blur();
        this.hideFocus = false;
    }).mouseup(function () {
        this.blur();
        this.hideFocus = true;
    });

    mostrarInicializables();
    cargarPagina(obtenerNombrePaginaActual(), "Braillear");
});
