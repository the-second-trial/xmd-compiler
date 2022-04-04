from wsgiref.simple_server import make_server

from application import application as app

hostname = "localhost"
port = 8080

if __name__ == "__main__":
    srv = make_server(hostname, port, app)
    print("Server started at http://%s:%s" % (hostname, port))

    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass

    srv.shutdown()
    print("Server stopped")
