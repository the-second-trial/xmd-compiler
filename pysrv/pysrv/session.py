from pysrv.utils import generate_id

# Manager of sessions.
class SessionsManager:
    def __init__(self):
        self.sessions = {} # A dictionary of sessions indexed by session ID
    
    # Retrieves a session.
    def get_session(self, sid: str):
        try:
            session = self.sessions[sid]
        except:
            return None
        
        return session
    
    # Creates a new session and returns its ID.
    def new_session(self) -> str:
        sid = generate_id()
        self.sessions[sid] = { "globals": {} }
        return sid
    
    # Deletes a session.
    def delete_session(self, sid) -> str:
        if sid not in self.sessions:
            return ""

        del self.sessions[sid]
        return sid
    
    # Executes code inside a session.
    # Returns the context of the session after running the code.
    def eval_on_session(self, sid, src) -> object:
        session = self.get_session(sid)
        if (session is None):
            return RuntimeError(f"Session {sid} not found")
        
        exec(src, session["globals"])

        return session["globals"]
