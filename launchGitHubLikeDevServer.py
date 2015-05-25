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
import time

"""
Inicia un webserver configurado con los headers que retorna GitHub Pages(GHP):
    Expires: Fecha GMT actual    +10 minutos
    Cache-Control: max-age=600   =10 minutos
"""
class GPlikeRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.githubpages_headers()
        SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)

    """Agrega headers que usa GHP"""
    def githubpages_headers(self):
        timestamp = time.time() + 600
        year, month, day, hh, mm, ss, wd, y, z = time.gmtime(timestamp)
        s = "%s, %02d %3s %4d %02d:%02d:%02d GMT" % (
                self.weekdayname[wd],
                day, self.monthname[month], year,
                hh, mm, ss)
        self.send_header("Cache-Control", "max-age=600")
        self.send_header("Expires", s)

    """Asegura el Content-type correcto para el manifest appcache (=GHP)"""
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
    SimpleHTTPServer.test(HandlerClass=GPlikeRequestHandler)
