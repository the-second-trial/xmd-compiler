import unittest

from pysrv.session import evaluate_chunk

SRC_001 = """
class MyClass:
    def __init__(self):
        pass
a = 0"""


class EvaluateChunkTestCase(unittest.TestCase):

    def test_context_is_updated(self):
        # Arrange
        glbl = {}

        # Act
        result = evaluate_chunk(SRC_001, glbl)

        # Assert
        self.assertTrue("a" in glbl, "Code not correctly executed")
        self.assertEqual(glbl["a"], 0, "Code not correctly executed")
