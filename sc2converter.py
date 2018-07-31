"""
A Converter converts between:
    examples (each one a dict with keys like "filename" and "label")
    arrays (numpy arrays input to or output from a network)

Dataset augmentation can be accomplished with a Converter that returns a
different array each time to_array is called with the same example
"""
import os
import numpy as np
import random
import imutil

from datasetutil.converter import Converter
from sc2util.pysc2_util import load_png_to_sc2_feature_map
from sc2util.representation import expand_pysc2_to_neural_input


class SC2FeatureMapConverter(Converter):
    def __init__(self,
            dataset,
            size=64,
            **kwargs):
        self.data_dir = dataset.data_dir
        self.size = size

    def to_array(self, example):
        curr = self.filename_to_featuremap(self.get_filename(example, 'filename'))
        next = self.filename_to_featuremap(self.get_filename(example, 'next_filename'))
        rgb_curr = self.filename_to_rgb(self.get_filename(example, 'rgb_filename'))
        rgb_next = self.filename_to_rgb(self.get_filename(example, 'next_rgb_filename'))
        return curr, next, rgb_curr, rgb_next

    def get_filename(self, example, key):
        filename = os.path.expanduser(example[key])
        if not filename.startswith('/'):
            filename = os.path.join(self.data_dir, filename)
        return filename

    def filename_to_featuremap(self, filename):
        pysc2_features = load_png_to_sc2_feature_map(filename)
        neural_input = expand_pysc2_to_neural_input(pysc2_features, resize_to=self.size)
        return neural_input

    def filename_to_rgb(self, filename):
        pixels = imutil.decode_jpg(filename, resize_to=None)
        pixels /= 255.
        return np.moveaxis(pixels, -1, 0)

    def from_array(self, array):
        return array


# QValueConverter extracts action-value pairs from Dataset files
# A network performs regression to a Q-value for each possible action
# The label consists of a ground truth value for one action (set to 1 in the mask)
# Other actions (set to 0 in the mask) should be ignored in the loss
class QValueConverter(Converter):
    def __init__(self, dataset, action_key='action', value_key='value', **kwargs):
        self.action_key = action_key
        self.value_key = value_key
        self.actions = sorted(list(set(get_labels(dataset, action_key))))
        self.num_classes = len(self.actions)
        print("QValueConverter: actions are {}".format(self.actions))
        values = set(get_labels(dataset, value_key))
        self.min_val = float(min(values))
        self.max_val = float(max(values))
        print('Q value range: from {} to {}'.format(self.min_val, self.max_val))
        if self.min_val == self.max_val:
            print('Warning: No Q value range')
            self.max_val += 1.0

    def to_array(self, example):
        qvals = np.zeros(self.num_classes)
        mask = np.zeros(self.num_classes)
        qvals[example[self.action_key] - 1] = (example[self.value_key] - self.min_val) / (self.max_val - self.min_val)
        mask[example[self.action_key] - 1] = 1
        return qvals, mask


def get_labels(dataset, label_key):
    unique_labels = set()
    for example in dataset.examples:
        if label_key in example:
            unique_labels.add(example[label_key])
    return sorted(list(unique_labels))
