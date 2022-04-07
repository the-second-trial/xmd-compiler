import json

from pysrv.session import SessionsManager

HTTP_STATUS_200 = "200 OK"
HTTP_STATUS_400 = "400 Bad Request"
HTTP_STATUS_500 = "500 Internal Server Error"

HTTP_HEADER_NAME_CONTENT_TYPE = "Content-Type"
HTTP_HEADER_NAME_CONTENT_LENGTH = "Content-Length"
HTTP_HEADER_VALUE_MIME_APP_JSON = "application/json"
HTTP_HEADER_VALUE_MIME_TXT_JSON = "text/json"

APP_ROUTE_PING = "/ping"
APP_ROUTE_NEW_SESSION = "/newSession"
APP_ROUTE_DEL_SESSION = "/delSession"
APP_ROUTE_EVAL_CHUNK = "/evalChunk"


def respond(status, body, start_response):
    """Creates a proper response with all headers set up."""

    json_body = json.dumps(body)
    res_headers = [
        (HTTP_HEADER_NAME_CONTENT_TYPE, HTTP_HEADER_VALUE_MIME_APP_JSON),
        (HTTP_HEADER_NAME_CONTENT_LENGTH, str(len(json_body)))
    ]

    start_response(status, res_headers)

    return [json_body.encode()]


def read_req_body(environ):
    """Reads the body of a request and properly returns it."""

    try:
        # Variable CONTENT_LENGTH may be empty or missing
        request_body_size = int(environ.get(HTTP_HEADER_NAME_CONTENT_LENGTH, 0))
    except ValueError:
        request_body_size = 0

    request_body = environ["wsgi.input"].read(request_body_size)

    if environ["CONTENT_TYPE"] in [HTTP_HEADER_VALUE_MIME_TXT_JSON, HTTP_HEADER_VALUE_MIME_APP_JSON]:
        return json.loads(request_body)

    return request_body


def bad(start_response):
    """Creates a 400 response."""

    return respond(HTTP_STATUS_400, {}, start_response)


def error(body, start_response):
    """Creates a 500 response."""

    return respond(HTTP_STATUS_500, body, start_response)


def ok(body, start_response):
    """Creates a 200 response."""
    return respond(HTTP_STATUS_200, body, start_response)


def unknown(environ, start_response):
    """Creates a response for handling an unknown route."""

    return bad(start_response)


class Application:
    """The application entry point.

    Status codes: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
    """

    def __init__(self):
        self.sessions = SessionsManager()

    def __call__(self, environ, start_response):
        route = environ["PATH_INFO"]

        if route == APP_ROUTE_PING:
            return self.ping()

        if route == APP_ROUTE_NEW_SESSION:
            return self.new_session(environ, start_response)

        if route == APP_ROUTE_DEL_SESSION:
            return self.del_session(environ, start_response)

        if route == APP_ROUTE_EVAL_CHUNK:
            return self.eval_chunk(environ, start_response)

        return unknown(environ, start_response)

    def ping(self, start_response):
        """Route: GET /ping."""

        return ok({"result": "pong"}, start_response)

    def new_session(self, environ, start_response):
        """Route: GET /newSession."""

        sid = self.sessions.new_session()
        return ok({"sid": sid}, start_response)

    def del_session(self, environ, start_response):
        """Route: POST /delSession."""

        try:
            body = read_req_body(environ)
            sid = body["sid"]
        except:
            return bad(start_response)

        sid2 = self.sessions.delete_session(sid)

        if sid == sid2:
            return ok({}, start_response)

        return error({
            "error": f"Session removed but 2-check failed: {sid} != {sid2}"
        }, start_response)

    def eval_chunk(self, environ, start_response):
        """Route: POST /evalChunk."""

        try:
            body = read_req_body(environ)
            sid = body["sid"]
            src = body["src"]
        except:
            return bad(start_response)

        session = self.sessions.get_session(sid)
        if session is None:
            return bad(start_response)

        self.sessions.eval_on_session(sid, src)

        return ok({"status": "ok"})
