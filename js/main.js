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

var $loader, $menuItemActivo, $contenedor;
var appCache, hayActualizacionPendiente = false;
var Braillear = null;

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
 * Handler, se ejecuta cuando hay una nueva versión de Braillear disponible
 * @returns {undefined}
 */
function onUpdateReady() {
    hayActualizacionPendiente = false;
    if (appCache.status === appCache.UPDATEREADY) {
        hayActualizacionPendiente = true;
    }
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
    // Si había actualización, la aplica actualizacion al cambiar de seccion
    if (hayActualizacionPendiente) {
        // TODO: preciso poner a mano aqui la pagina destino? asi carga esa y no otra.. la pone pero al refrescar la pierde
        // creo que el reload la lleva a la original (en lo que a #... se refiere)
        appCache.swapCache();
        location.reload();
        return;
    }

    var nombrePaginaReal = "404";
    if (nombrePagina) {
        nombrePaginaReal = nombrePagina = nombrePagina.substring(1);
    }

    if ($menuItemActivo) {
        $menuItemActivo.removeClass("active");
    }

    $contenedor.hide();
    if (Braillear && Braillear.destruir) {
        Braillear.destruir();
    }
    Braillear = {};

    $("#tituloPagina").text(tituloPagina || nombrePagina || "Braillear");
    $loader.fadeIn("fast", function () {
        $.ajax({
            url: nombrePaginaReal + ".html",
            method: 'GET',
            cache: true, // Offline singlepage application
            async: true
        }).done(function (template) {
            $menuItemActivo = $(this).closest("li");
            $contenedor.html(template);
        }).fail(function () {
            if (nombrePaginaReal !== "404") {
                cargarPagina();
            }
        }).always(function () {
            if ($menuItemActivo) {
                $menuItemActivo.addClass("active");
            }
            $contenedor.fadeIn("fast", function () {
                $loader.fadeOut("fast");
                if (Braillear.inicializar) {
                    Braillear.inicializar();
                }
                /* TODO:
                 * Buscar algun truco para quitar foco al link(al menos con el teclado)
                 * sino al dar enter recarga...
                 * podría crear algun boton fuera de pantalla y darle foco? que no haga nada..
                 */
            });
        });
    });
    return true;
}


$(function () {
    appCache = window.applicationCache;
    appCache.update();
    appCache.addEventListener('updateready', onUpdateReady);

    $loader = $("#msgCargando");
    $contenedor = $('#contenedor');

    $("ul.navbar-nav li a[href^=#], .navbar-header a").click(function () {
        cargarPagina($(this).attr("href"), $(this).text());
        if ($('.navbar-toggle[data-target="#navbar-main"][aria-expanded=true]').length) {
            $('#navbar-main').collapse('toggle');
        }
    });

    mostrarInicializables();
    var posComienzoNombrePagina = document.URL.lastIndexOf("#");
    var paginaInicial = posComienzoNombrePagina > 0 ? document.URL.substring(posComienzoNombrePagina) : "#home";
    cargarPagina(paginaInicial, "Braillear");
});
