import json
from copy import deepcopy
from logging import getLogger

from .session import SessionsManager

HTTP_STATUS_200 = "200 OK"
HTTP_STATUS_400 = "400 Bad Request"
HTTP_STATUS_500 = "500 Internal Server Error"

HTTP_METHOD_GET = "GET"
HTTP_METHOD_POST = "POST"

HTTP_HEADER_NAME_CONTENT_TYPE = "Content-Type"
HTTP_HEADER_NAME_CONTENT_LENGTH = "Content-Length"
HTTP_HEADER_VALUE_MIME_APP_JSON = "application/json"
HTTP_HEADER_VALUE_MIME_TXT_JSON = "text/json"

APP_ROUTE_PING = "/ping"
APP_ROUTE_NEW_SESSION = "/newSession"
APP_ROUTE_DEL_SESSION = "/delSession"
APP_ROUTE_EVAL_CHUNK = "/evalChunk"

RESULT_OK = "ok"
RESULT_ERROR = "error"

LOGGER_NAME = __name__


def respond(status, body, result, start_response):
    """Creates a proper response with all headers set up."""

    body_clone = deepcopy(body)
    if result is not None:
        body_clone["result"] = result

    json_body = json.dumps(body_clone)
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
        request_body_size = int(environ["CONTENT_LENGTH"])
    except ValueError:
        request_body_size = 0

    request_body = environ["wsgi.input"].read(request_body_size)

    if environ["CONTENT_TYPE"] in [HTTP_HEADER_VALUE_MIME_TXT_JSON, HTTP_HEADER_VALUE_MIME_APP_JSON]:
        return json.loads(request_body)

    return request_body


def bad(start_response, why=None):
    """Creates a 400 response."""

    body = {"reason": why} if why is not None else {}
    return respond(HTTP_STATUS_400, body, RESULT_ERROR, start_response)


def error(body, start_response):
    """Creates a 500 response."""

    return respond(HTTP_STATUS_500, body, RESULT_ERROR, start_response)


def ok(body, start_response):
    """Creates a 200 response."""
    return respond(HTTP_STATUS_200, body, RESULT_OK, start_response)


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
        logger = getLogger(LOGGER_NAME)

        route = environ["PATH_INFO"]
        method = environ["REQUEST_METHOD"].upper()
        logger.info(f"Processing request: {method} {route}")

        if route == APP_ROUTE_PING and method == HTTP_METHOD_GET:
            return self.ping(start_response)

        if route == APP_ROUTE_NEW_SESSION and method == HTTP_METHOD_POST:
            return self.new_session(environ, start_response)

        if route == APP_ROUTE_DEL_SESSION and method == HTTP_METHOD_POST:
            return self.del_session(environ, start_response)

        if route == APP_ROUTE_EVAL_CHUNK and method == HTTP_METHOD_POST:
            return self.eval_chunk(environ, start_response)

        return unknown(environ, start_response)

    def ping(self, start_response):
        """Route: GET /ping."""

        return ok({"reply": "pong"}, start_response)

    def new_session(self, environ, start_response):
        """Route: POST /newSession."""

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

        logger = getLogger(LOGGER_NAME)

        try:
            body = read_req_body(environ)
            sid = body["sid"]
            src = body["src"]
        except Exception as e:
            logger.error(f"Method eval_chunk - Invalid body ergs: {type(e).__name__} - {str(e)}")
            return bad(start_response, "Invalid args passed in the body. Expected 'sid' and 'src'.")

        session = self.sessions.get_session(sid)
        if session is None:
            logger.error(f"Method eval_chunk - Session not found: {sid}")
            return bad(start_response, f"Session '{sid}' not found, use POST {APP_ROUTE_NEW_SESSION} to create one.")

        try:
            eval_result = self.sessions.eval_on_session(sid, src)
            expr_result = eval_result["ret"]
        except:
            return error({"error": "Chunk evaluation failed"}, start_response)

        logger.info(f"Chunk evaluated, expr result is '{expr_result}'")

        return ok({"expr_result": expr_result}, start_response)
