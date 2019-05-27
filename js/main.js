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

var $loader, $contenedor, $contenedorPortada;
var appCache, hayActualizacionPendiente = false, timerAutoRefresh;
Braillear = null;

/**
 * Muestra los elementos con señalados con clase inicializable
 *
 * @param {Element} $padre   Opcional. Elemento desde el cual buscar
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
 * @returns {undefined}
 */
function mostrarError(nombrePagina) {
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
        cargarPagina(nombrePagina);
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
function onCacheUpgradeError(error) {
    console.warn('Error al verificar actualizaciones', error);
}

/**
 * Devuelve el nombre de página actual, por defecto #portada
 * @returns {String}
 */
function obtenerNombrePaginaActual() {
    return window.location.hash || "#portada";
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

    return window.location.origin + window.location.pathname + pagina;
}

/**
 * Scroll a comienzo de página
 *
 * @returns {undefined}
 */
function subirAlComiezo() {
    $('html,body').animate({scrollTop: 0}, 'slow');
}

/**
 * Configura enlaces a .html locales para funcionar como Single Page Application
 *
 * @param {Element} $padre   Opcional. Elemento desde el cual buscar enlaces.
 * @returns {undefined}
 */
function configurarEnlacesSPA($padre) {
    $padre = $padre || $(document);
    $padre.find("a[href$=\\.html]:not([href^=http])").each(function (idx, link) {
        var $link = $(link);
        var pagina = $link.attr('href');
        pagina = pagina.substring(0, pagina.indexOf(".html"));
        pagina = '#' + (pagina === 'index' ? 'portada' : pagina);
        $link.attr('href', pagina);
    });
}

/**
 * Carga una página en el $contenedor del app.
 * Muestra el $loader temporalmente. Los metodos destruir() e inicializar() de
 * Braillear son invocados antes y despues de la carga, si existen y es exitosa.
 *
 * @param {String} nombrePagina     Nombre de la página a cargar. Ej: "#faq"
 */
function cargarPagina(nombrePagina) {
    if (timerAutoRefresh) {
        timerAutoRefresh = clearTimeout(timerAutoRefresh);
    }

    if (hayActualizacionPendiente) {
        appCache.swapCache();
        window.location = obtenerURLPagina(nombrePagina);
        window.location.reload();
    }

    var nombrePagina = nombrePagina ? nombrePagina.substring(1) : "portada";

    $('ul.navbar-nav li').closest("li").removeClass("active");
    $contenedor.hide();
    if (Braillear && Braillear.destruir) {
        Braillear.destruir();
    }
    Braillear = {};
    $contenedor.text('');

    if (nombrePagina === 'portada') {
        $contenedorPortada.fadeIn("fast");
    } else {
        if ($contenedorPortada.is(":visible")) {
            $contenedorPortada.hide();
        }

        $loader.fadeIn("fast", function () {
            $.ajax({
                url: nombrePagina + ".html",
                type: 'GET',
                cache: true, // Braillear funciona como offline single page application
                async: true,
                dataType: 'html'
            }).done(function (template) {
                $contenedor.html(template);
                $contenedor.find(".toTop").click(subirAlComiezo);
                configurarEnlacesSPA($contenedor);
            }).fail(function () {
                mostrarError('#' + nombrePagina);
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
    }
    
    return;
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
    if(window.location.protocol === "http:") {
        window.location.protocol = "https:";
        return;
    }
    console.log('*** Bienvenido a Braillear ***');
    if ($('html').attr('manifest')) {
        appCache = window.applicationCache;
        appCache.addEventListener('updateready', onUpdateReady);
        appCache.addEventListener('checking', onCheckingUpdate);
        appCache.addEventListener('error', onCacheUpgradeError);
        if (appCache.status === appCache.IDLE || appCache.status > appCache.DOWNLOADING) {
            appCache.update();
        }
    } else {
        console.warn('* Cache offline deshabilitado.');
    }

    $contenedor = $('#contenedor');
    $contenedorPortada = $('#contenedorPortada');
    $loader = $("#msgCargando").hide();

    // Cierre del menu al elegir opcion + quitar foco cuando elige una
    $("ul.navbar-nav li a:not([data-toggle]), .navbar-header a:not([data-toggle])").click(function () {
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

    // Cargamos las secciones cuando cambia el hash
    if ("onhashchange" in window) {
        window.onhashchange = function () {
            cargarPagina(window.location.hash);
        };
    } else { // polyfill
        var hashAnterior = window.location.hash;
        window.setInterval(function () {
            if (window.location.hash !== hashAnterior) {
                hashAnterior = window.location.hash;
                cargarPagina(hashAnterior);
            }
        }, 200);
    }

    configurarEnlacesSPA();

    var paginaInicial = obtenerNombrePaginaActual();
    if (paginaInicial !== '#portada') {
        cargarPagina(paginaInicial);
    }
});
