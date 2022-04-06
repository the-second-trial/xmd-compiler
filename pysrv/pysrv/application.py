import json

from pysrv.session import SessionsManager

HTTP_STATUS_200 = "200 OK"
HTTP_STATUS_400 = "400 Bad Request"
HTTP_STATUS_500 = "500 Internal Server Error"

HTTP_HEADER_NAME_CONTENT_TYPE = "Content-Type"
HTTP_HEADER_NAME_CONTENT_LENGTH = "Content-Length"
HTTP_HEADER_VALUE_MIME_APP_JSON = "application/json"
HTTP_HEADER_VALUE_MIME_TXT_JSON = "text/json"

APP_ROUTE_NEW_SESSION = "/newSession"
APP_ROUTE_DEL_SESSION = "/delSession"
APP_ROUTE_EVAL_CHUNK = "/evalChunck"

# The application entry point.
# Status codes: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
class Application:
    def __init__(self):
        self.sessions = SessionsManager()
    
    def __call__(self, environ, start_response):
        route = environ["PATH_INFO"]

        if (route == APP_ROUTE_NEW_SESSION):
            return self.new_session(environ, start_response)
        
        if (route == APP_ROUTE_DEL_SESSION):
            return self.del_session(environ, start_response)
        
        if (route == APP_ROUTE_EVAL_CHUNK):
            return self.eval_chunk(environ, start_response)
        
        return self.unknown(environ, start_response)
    
    # Route: GET /newSession
    def new_session(self, environ, start_response):
        sid = self.sessions.new_session()
        return self.ok({ "sid": sid }, start_response)
    
    # Route: POST /delSession
    def del_session(self, environ, start_response):
        try:
            body = self.read_req_body(environ)
            sid = body["sid"]
        except:
            return self.bad(start_response)
        
        sid2 = self.sessions.delete_session(sid)

        if (sid == sid2):
            return self.ok({}, start_response)
        
        return self.error({
            "error": f"Session removed but 2-check failed: {sid} != {sid2}"
        }, start_response)

    # Route: POST /evalChunck
    def eval_chunk(self, environ, start_response):
        try:
            body = self.read_req_body(environ)
            sid = body["sid"]
            src = body["src"]
        except:
            return self.bad(start_response)
        
        session = self.sessions.get_session(sid)
        if (session is None):
            return self.bad(start_response)
        
        self.sessions.eval_on_session(sid, src)
        
        return self.ok({ "status": "ok" })

    def unknown(self, environ, start_response):
        return self.bad(start_response)
    
    def ok(self, body, start_response):
        return self.respond(HTTP_STATUS_200, body, start_response)
    
    def error(self, body, start_response):
        return self.respond(HTTP_STATUS_500, body, start_response)
    
    def bad(self, start_response):
        return self.respond(HTTP_STATUS_400, {}, start_response)

    def respond(self, status, body, start_response):
        json_body = json.dumps(body)
        res_headers = [
            (HTTP_HEADER_NAME_CONTENT_TYPE, HTTP_HEADER_VALUE_MIME_APP_JSON),
            (HTTP_HEADER_NAME_CONTENT_LENGTH, str(len(json_body)))
        ]

        start_response(status, res_headers)

        return [json_body.encode()]
    
    def read_req_body(self, environ):
        # Variable CONTENT_LENGTH may be empty or missing
        try:
            request_body_size = int(environ.get(HTTP_HEADER_NAME_CONTENT_LENGTH, 0))
        except (ValueError):
            request_body_size = 0

        request_body = environ["wsgi.input"].read(request_body_size)

        if (environ["CONTENT_TYPE"] in [HTTP_HEADER_VALUE_MIME_TXT_JSON, HTTP_HEADER_VALUE_MIME_APP_JSON]):
            return json.loads(request_body)

        return request_body
