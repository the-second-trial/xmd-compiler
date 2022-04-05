class Application:
    def __init__(self):
        self.counter = 0
    
    def __call__(self, environ, start_response):
        res = "{'v': '%s'}" % self.counter

        res_headers = [
            ("Content-Type", "application/json"),
            ("Content-Length", str(len(res)))
        ]

        print("METHOD: %s" % environ["REQUEST_METHOD"])

        start_response("200 OK", res_headers)

        self.counter += 1

        return [res.encode()]
