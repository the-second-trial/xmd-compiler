import random
import string


def generate_id(len=6, chars=string.ascii_uppercase + string.digits):
    """Generates a random ID."""

    return "".join(random.choice(string.hexdigits + string.digits) for _ in range(len))
