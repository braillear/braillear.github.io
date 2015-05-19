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
Braillear = null;

/**
 * Carga una página en el $contenedor del app.
 * Muestra el $loader temporalmente. Los metodos destruir() e inicializar() de
 * Braillear son invocados antes y despues de la carga, si existen y es exitosa.
 *
 * @param {String} nombrePagina     Nombre de la página a cargar. Ej: "#faq"
 * @param {String} tituloPagina     Título de la página, Ej: "F.A.Q."
 */
function cargarPagina(nombrePagina, tituloPagina) {
    var nombrePaginaReal = "404";
    if (nombrePagina) {
        nombrePaginaReal = nombrePagina = nombrePagina.substring(1);
    }

    if ($menuItemActivo) {
        $menuItemActivo.removeClass("active");
    }
    $contenedor.fadeOut("fast");

    $("#tituloPagina").text(tituloPagina || nombrePagina || "Braillear");
    $loader.fadeIn("fast");

    if (Braillear && Braillear.destruir) {
        Braillear.destruir();
    }
    Braillear = {};

    $.ajax({
        url: nombrePaginaReal + ".html",
        method: 'GET',
        cache: false,
        async: true
    }).done(function (template) {
        $menuItemActivo = $(this).closest("li");
        $contenedor.html(template);
    }).fail(function () {
        if (nombrePaginaReal === "404") {
            $contenedor.html("\
                <div class=\"alert alert-danger\">\
                    <big><strong>Upps!!!</strong>, el servidor no responde</big><br/>\
                    Lo sentimos, intenta utilizar Braillear más tarde.\
                </div>");
        } else {
            cargarPagina();
        }
    }).always(function () {
        if ($menuItemActivo) {
            $menuItemActivo.addClass("active");
        }
        $contenedor.fadeIn("slow", function () {
            if (Braillear.inicializar) {
                Braillear.inicializar();
            }
            $loader.fadeOut("fast");
        });
    });
}

$(function () {
    $loader = $("#msgCargando");
    $contenedor = $('#contenedor');

    $("ul.navbar-nav li a[href^=#], .navbar-header a").click(function () {
        cargarPagina($(this).attr("href"), $(this).text());
        if ($('.navbar-toggle[data-target="#navbar-main"][aria-expanded=true]').length) {
            $('#navbar-main').collapse('toggle');
        }
    });

    var posComienzoNombrePagina = document.URL.lastIndexOf("#");
    var paginaInicial = posComienzoNombrePagina > 0 ? document.URL.substring(posComienzoNombrePagina) : "#home";
    cargarPagina(paginaInicial, "Braillear");
});