import unittest

from pysrv.session import evaluate_chunk

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
