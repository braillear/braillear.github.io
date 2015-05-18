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

function cargarPagina(nombrePagina, tituloPagina) {
    var nombrePaginaReal;
    if (!nombrePagina) {
        nombrePaginaReal = "404";
        nombrePagina = "Braillear";
    } else {
        nombrePaginaReal = nombrePagina = nombrePagina.substring(1)
    }


    if ($menuItemActivo) {
        $menuItemActivo.removeClass("active");
    }

    $contenedor.fadeOut("fast");
    $("#tituloPagina").text(tituloPagina || nombrePagina);
    $loader.fadeIn("fast");

    $.ajax({
        url: nombrePaginaReal + ".html",
        method: 'GET',
        cache: false,
        async: true
    }).done(function (template) {
        $menuItemActivo = $(this).closest("li");
        $contenedor.html(template);
    }).fail(function () {
        cargarPagina();
    }).always(function () {
        if ($menuItemActivo) {
            $menuItemActivo.addClass("active");
        }
        $contenedor.fadeIn("slow").focus();
        $loader.fadeOut("slow");
    });
}

$(function () {
    $loader = $("#msgCargando");
    $contenedor = $('#contenedor');

    $("ul.navbar-nav li a[href^=#], .navbar-header a").click(function () {
        cargarPagina($(this).attr("href"), $(this).text());
    });

    var posComienzoNombrePagina = document.URL.lastIndexOf("#");
    var paginaInicial = posComienzoNombrePagina > 0 ? document.URL.substring(posComienzoNombrePagina) : "#home";
    cargarPagina(paginaInicial);
});