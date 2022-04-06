import random
import string

# Generates a random ID
def generate_id(len=6, chars=string.ascii_uppercase + string.digits):
    return "".join(random.choice(string.hexdigits + string.digits) for _ in range(len))
