import unittest

from pysrv.session import evaluate_chunk, SessionsManager

SRC_001 = """
class MyClass:
    def __init__(self):
        pass
a = 0"""

SRC_002 = """
class MyClass:
    def __init__(self):
        pass
a = 0
a"""

SRC_003 = """
a = 10
a"""

SRC_004 = """
a = 10.3
a"""


class EvaluateChunkTestCase(unittest.TestCase):

    def test_context_is_updated(self):
        # Arrange
        glbl = {}

        # Act
        result = evaluate_chunk(SRC_001, glbl)

        # Assert
        self.assertTrue("a" in glbl, "Code not correctly executed")
        self.assertEqual(glbl["a"], 0, "Code not correctly executed")

    def test_when_no_expr_ending_code_then_no_ret_value(self):
        # Arrange
        glbl = {}

        # Act
        result = evaluate_chunk(SRC_001, glbl)

        # Assert
        self.assertIsNone(result, "Expected no return value as chunk has no ending expr")

    def test_when_expr_ending_code_then_ret_value(self):
        # Arrange
        glbl = {}

        # Act
        result = evaluate_chunk(SRC_002, glbl)

        # Assert
        self.assertIsNotNone(result, "Expected return value as chunk has ending expr")
        self.assertEqual(result, 0, "Wrong returned expression result")

    def test_ret_value_int(self):
        # Arrange
        glbl = {}

        # Act
        result = evaluate_chunk(SRC_003, glbl)

        # Assert
        self.assertEqual(type(result).__name__, int.__name__)
        self.assertEqual(result, 10, "Wrong returned expression result")

    def test_ret_value_float(self):
        # Arrange
        glbl = {}

        # Act
        result = evaluate_chunk(SRC_004, glbl)

        # Assert
        self.assertEqual(type(result).__name__, float.__name__)
        self.assertEqual(result, 10.3, "Wrong returned expression result")


class SessionsManagerTestCase(unittest.TestCase):

    def test_context_is_empty_initially(self):
        # Arrange
        # Act
        sm = SessionsManager()

        # Assert
        self.assertDictEqual(sm.sessions, {}, "Dictionary of sessions expected empty initially")

    def test_new_session_returns_sid(self):
        # Arrange
        sm = SessionsManager()

        # Act
        sid = sm.new_session()

        # Assert
        self.assertIsNotNone(sid)
        self.assertTrue(len(sid) > 0)

    def test_new_sessions_different_sids(self):
        # Arrange
        sm = SessionsManager()

        # Act
        sid1 = sm.new_session()
        sid2 = sm.new_session()

        # Assert
        self.assertNotEqual(sid1, sid2, "Sids should be different")

    def test_existing_session_can_be_retrieved(self):
        # Arrange
        sm = SessionsManager()

        # Act
        sid = sm.new_session()
        session = sm.get_session(sid)

        # Assert
        self.assertIsNotNone(session)
        self.assertDictEqual(session["globals"], {}, "Context of newly created session expected empty")

    def test_non_existing_session_cannot_be_retrieved(self):
        # Arrange
        sm = SessionsManager()

        # Act
        session = sm.get_session("000")

        # Assert
        self.assertIsNone(session)

    def test_sessions_can_be_successfully_deleted(self):
        # Arrange
        sm = SessionsManager()

        # Act
        # Assert
        sid = sm.new_session()
        session = sm.get_session(sid)
        self.assertIsNotNone(session)

        session2 = sm.delete_session(sid)
        self.assertIsNotNone(session2)
        self.assertEqual(session2["sid"], sid)
        self.assertDictEqual(session, session2["session"])

        session3 = sm.get_session(sid)
        self.assertIsNone(session3)

    def test_non_existing_sessions_cause_error_upon_deletion(self):
        # Arrange
        sm = SessionsManager()

        # Act
        # Assert
        self.assertRaises(RuntimeError, lambda: sm.delete_session("000"))

    def test_non_existing_sessions_cause_error_upon_evaluation(self):
        # Arrange
        sm = SessionsManager()

        # Act
        # Assert
        self.assertRaises(RuntimeError, lambda: sm.eval_on_session("000", ""))

    def test_simple_code_correctly_executed_upon_evaluation(self):
        # Arrange
        sm = SessionsManager()

        # Act
        sid = sm.new_session()
        eval_res = sm.eval_on_session(sid, "a = 0")

        # Assert
        self.assertIsNotNone(eval_res)

        context = eval_res["context"]
        self.assertIsNotNone(context["a"])
        self.assertEqual(context["a"], 0)

    def test_code_evaluated_on_same_session_acts_on_same_context(self):
        # Arrange
        sm = SessionsManager()

        # Act
        # Assert
        sid = sm.new_session()

        context = sm.eval_on_session(sid, "a = 0")["context"]
        self.assertEqual(context["a"], 0)
        self.assertRaises(KeyError, lambda: context["b"])

        context = sm.eval_on_session(sid, "b = 0")["context"]
        self.assertEqual(context["a"], 0)
        self.assertEqual(context["b"], 0)

    def test_code_without_ending_expr_evaluates_without_ret(self):
        # Arrange
        sm = SessionsManager()

        # Act
        sid = sm.new_session()
        eval_res = sm.eval_on_session(sid, SRC_001)

        # Assert
        self.assertIsNone(eval_res["ret"], "Code does not have an ending expr, no ret expected")

    def test_code_with_ending_expr_evaluates_with_ret(self):
        # Arrange
        sm = SessionsManager()

        # Act
        sid = sm.new_session()
        eval_res = sm.eval_on_session(sid, SRC_003)

        # Assert
        self.assertIsNotNone(eval_res["ret"], "Code has an ending expr, ret is expected")
        self.assertEqual(eval_res["ret"], 10)
