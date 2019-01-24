import http.server
import socketserver

PORT = 8000

class Serv(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        try:
            file_to_open = open(self.path[1:]).read()
            self.send_response(200)
        except:
            file_to_open = "File not found"
            self.send_response(404)
        self.end_headers()
        self.wfile.write(bytes(file_to_open, 'utf-8'))

httpd = http.server.HTTPServer(('localhost', PORT), Serv)
httpd.serve_forever()

# def start_server():
#     print("Do nothing for now")

# if __name__ == "__main__":
#     start_server()