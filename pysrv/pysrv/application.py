def application(environ, start_response):
    res = "{'a': 'Hello'}"

    res_headers = [
        ("Content-Type", "application/json"),
        ("Content-Length", str(len(res)))
    ]

    start_response("200 OK", res_headers)

    return [res.encode()]
