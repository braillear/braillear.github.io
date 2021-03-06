#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (C) 2015 Lucas Capalbo Lavezzo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


import SimpleHTTPServer


"""
Inicia un webserver configurado con los headers necesarios para evitar
el cacheo del manifest en el cliente (evitaría que detecte los cambios), y el
cacheo de recursos del manifest por parte del browser en el cache estandar,
fuera del appCache (evitaría que descargue los recursos cuando detecte cambios
en el manifest).
No es exactamente lo que envía GitHub Pages, usar launchGitHubLikeDevServer.py
"""
class CustomRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.custom_headers()
        SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)

    def custom_headers(self):
        # Cache-Control: no-store no sirve, no almacena ni al manifest (FF)
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    """Content-type correcto para el manifest .appcache"""
    def guess_type(self, path):
        mimetype = SimpleHTTPServer.SimpleHTTPRequestHandler.guess_type(
            self, path
        )
        if path.endswith('.appcache'):
            mimetype = 'text/cache-manifest'
        return mimetype



if __name__ == '__main__':
    print "\n* Iniciando servidor local."
    print "Puede iniciar este script indicando un numero de puerto si desea.\n"
    SimpleHTTPServer.test(HandlerClass=CustomRequestHandler)
