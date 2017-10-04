from __future__ import absolute_import
import random
import string


def generate_random_name(length=8):
    return ''.join(random.choice(string.ascii_uppercase) for _ in range(length))
