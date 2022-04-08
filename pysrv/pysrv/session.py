import ast

from .utils import generate_id


def evaluate_chunk(src, context):
    """Evaluates a chunk of code making sure certain effects happen

    This function ensures that the chunk of code is run with the provided context which will be updated.
    On another note, this function ensures that, if the chunk of code includes, as its last statement,
    an expression, then that expression is evaluated and its result returned.

    :returns The evaluated expression if a last expression is found.
    """

    chunk_ast = ast.parse(src, mode="exec")

    # Retrieve all direct children and look for the last one
    root_nodes = [n for n in ast.iter_child_nodes(chunk_ast)]
    last_node = root_nodes[-1]
    if isinstance(last_node, ast.Expr):
        # 1. Extract the last node and generate a separate AST without it
        if not isinstance(chunk_ast, ast.Module):
            raise RuntimeError(f"Chunk AST node expected to be Module, actual: '{type(chunk_ast).__name__}'")

        chunk_ast.body = chunk_ast.body[0:-1]
        reduced_src = ast.unparse(chunk_ast)

        # 2. Execute the first subtree
        exec(reduced_src, context)

        # 3. Evaluate the expression node and get the return value
        expr_src = ast.unparse(last_node)
        return eval(expr_src, context)

    exec(src, context)


class SessionsManager:
    """Manager of sessions."""

    def __init__(self):
        self.sessions = {}  # A dictionary of sessions indexed by session ID

    def get_session(self, sid: str):
        """Retrieves a session."""

        try:
            session = self.sessions[sid]
        except:
            return None

        return session

    def new_session(self) -> str:
        """Creates a new session and returns its ID."""

        sid = generate_id(len=16)
        self.sessions[sid] = {"globals": {}}
        return sid

    def delete_session(self, sid) -> str:
        """Deletes a session.

        Deletes a session, if present. If no session can be found, an error is raised.
        When a session is deleted, the sid and context are returned in a dictionary.
        """

        if sid not in self.sessions:
            raise RuntimeError(f"Session {sid} not found")

        session = self.sessions[sid]
        del self.sessions[sid]
        return {"sid": sid, "session": session}

    def eval_on_session(self, sid, src) -> object:
        """Executes code inside a session.

        :returns An object containing the context and the evaluated last expression in code if any.
        """

        session = self.get_session(sid)
        if session is None:
            raise RuntimeError(f"Session {sid} not found")

        result = evaluate_chunk(src, session["globals"])

        return {"context": session["globals"], "ret": result}
