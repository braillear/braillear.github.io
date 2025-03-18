#!/usr/bin/env python3
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


import http.server
import socketserver

"""
Inicia un webserver configurado con los headers necesarios para evitar
el cacheo.
No es exactamente lo que envía GitHub Pages, usar launchGitHubLikeDevServer.py
"""
class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.custom_headers()
        super().end_headers()

    def custom_headers(self):
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

if __name__ == '__main__':
    PORT = 8000
    Handler = CustomRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"serving at port {PORT}")
        httpd.serve_forever()