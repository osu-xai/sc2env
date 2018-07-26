import numpy as np


# These 12 units should be enough to build some cool maps
SC2_UNIT_IDS = sorted([
    48,  # marine
    49,  # reaper
    53,  # hellion
    57,  # battlecruiser
    73,  # zealot
    74,  # stalker
    83,  # immo
    141, # archon
    105, # zergling
    107, # hydra
    109, # ultra
    110, # roach
])


# Input: A 17-dimensional integer pysc2 feature map
# Output: A 18-dimensional float convolutional input map
def expand_pysc2_to_neural_input(feature_map, resize_to=None):
    neural_layers = []

    # Terrain height map, scaled 0 to 1
    terrain_height = (feature_map[0] / 255.).astype(float)
    neural_layers.append(terrain_height)

    # Binary mask: friendly units
    friendly_units = (feature_map[5] == 1).astype(float)
    neural_layers.append(friendly_units)

    # Binary mask: enemy units
    enemy_units = (feature_map[5] == 4).astype(float)
    neural_layers.append(enemy_units)

    # Categorical map of unit types (see SC2_UNIT_IDS)
    unit_layers = int_map_to_onehot(feature_map[6], SC2_UNIT_IDS)
    neural_layers.extend(unit_layers)

    # Unit Health Points (scaled 0 to 1)
    unit_hp = feature_map[9] / 255.
    neural_layers.append(unit_hp)

    # Unit Shield Points (scaled 0 to 1)
    unit_sp = feature_map[13] / 255.
    neural_layers.append(unit_sp)

    # Unit density (number of overlapping units, important when zoomed out)
    MAX_DENSITY = 4.
    unit_density = np.clip(feature_map[15] / MAX_DENSITY, 0, 1)
    neural_layers.append(unit_density)

    layers = np.array(neural_layers)

    if resize_to:
        from skimage.transform import resize
        num_channels = layers.shape[0]
        output_shape = (resize_to, resize_to, num_channels)
        layers_hwc = np.moveaxis(layers, 0, -1)
        layers_hwc = resize(layers_hwc, output_shape, anti_aliasing=True, preserve_range=True, mode='reflect')
        layers = np.moveaxis(layers_hwc, -1, 0)
    return layers



# Input: a 2d array of integers, eg. 105 for zergling, 48 for marine, etc
# Input shape: (height x width)
# Output: a 3d array of floats usable as input to a network
# Output shape: (height x width x number_of_unit_types)
def int_map_to_onehot(x, vocabulary=None):
    if vocabulary is None:
        # If no vocabulary is known, make a conservative assumption
        vocabulary = set(x.flatten())
    output_shape = (len(vocabulary),) + x.shape
    output_map = np.zeros(shape=output_shape, dtype=float)
    for i, id in enumerate(vocabulary):
        output_map[i][x == id] = 1.
    return output_map
"""
# Unit test for int_map_to_onehot
x = np.zeros((84, 84), dtype=int)
x[1,2] = 49
x[3,10] = 107
x[40:50, 60:70] = 105
assert int_map_to_onehot(x).shape == (4, 84, 84)
assert int_map_to_onehot(x, SC2_UNIT_IDS).shape == (len(SC2_UNIT_IDS), 84, 84)
"""
