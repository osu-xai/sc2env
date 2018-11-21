import unittest
import numpy as np
from sc2env import representation

class TestSC2Env(unittest.TestCase):
    def test_onehot(self):
        x = np.zeros((84, 84), dtype=int)
        x[1,2] = 51
        x[3,10] = 107
        x[40:50, 60:70] = 105
        assert representation.int_map_to_onehot(x).shape == (4, 84, 84)
        unit_map = representation.DEFAULT_SC2_UNITS
        assert representation.int_map_to_onehot(x, unit_map).shape == (len(unit_map), 84, 84)

    def test_onehot_unknown_unit(self):
        unit_map = representation.DEFAULT_SC2_UNITS
        x = np.zeros((84, 84), dtype=int)
        x[1,2] = 9999  # There is no unit id 9999
        try:
            representation.int_map_to_onehot(x, unit_map).shape == (len(unit_map), 84, 84)
            assert False
        except ValueError:
            # We expect a ValueError if the input contains an unexpected unit id
            pass

