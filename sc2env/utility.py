import numpy as np

SIMPLE_SC2_UNITS = {
    48,
    53,
    55,
    57,
    73,
    74,
    83,
    141,
    105,
    107,
    108,
    109,
    51,
    110}
#the input_screen_feature is input dictionary of the layers of screen feature you want to do the one hot map 
#input_screen_feature = {'PLAYER_RELATIVE': [1,3,4], 'HIT_POINT_RATIO': 0, 'UNIT_TYPE':SIMPLE_SC2_UNITS}
#SCREEN_SIZE = 40
def getOneHotState(state, input_screen_feature):
    screen_size = state[0].shape[0]
    #extend player id
    if 'PLAYER_RELATIVE' in input_screen_feature:
        tstate = int_map_to_onehot(np.array(state[5]),input_screen_feature['PLAYER_RELATIVE'])

    #extend unit type
    if 'UNIT_TYPE' in input_screen_feature:
        tstate = np.append(tstate, int_map_to_onehot(np.array(state[6]),input_screen_feature['UNIT_TYPE']), axis=0)

    #append unit hit point
    if 'HIT_POINT' in input_screen_feature:
        tstate = np.append(tstate, normalizeExceptZeros(state[8],
                                                             (0, 500)), axis=0)

    #append unit hit point ratio
    if 'HIT_POINT_RATIO' in input_screen_feature:
        SCALE = 255
        hit_point_ratio = state[9] / SCALE
        hit_point_ratio = np.reshape(hit_point_ratio, (1, screen_size, screen_size))
        tstate = np.append(tstate, hit_point_ratio, axis=0)

    #extend unit density
    if 'UNIT_DENSITY' in input_screen_feature:
        MAX_UNIT_DENSITY = 4
        unit_density = np.clip(state[14] / MAX_UNIT_DENSITY, 0, 1)
        unit_density = np.reshape(unit_density, (1, screen_size, screen_size))
        tstate = np.append(tstate, unit_density, axis=0)

    #append unit sheild
    if 'SHIELD' in input_screen_feature:
        tstate = np.append(tstate, normalizeExceptZeros(state[12],
                                                             (0, 500)), axis=0)

    #append unit sheild ratio
    if 'SHIELD_RATIO' in input_screen_feature:
        SCALE = 255
        shield_ratio = state[13] / SCALE
        shield_ratio = np.reshape(shield_ratio, (1, screen_size, screen_size))
        tstate = np.append(tstate, shield_ratio, axis=0)
    return tstate

def normalizeExceptZeros(state, certainRange = None):
    state = np.array(state)
    screen_size = state.shape[0]
    if certainRange is None:
#           state[state == 0] = state.min(state[np.nonzero(state)])
        nstate = (state - state.min()) / (state.max() - state.min())
    else:
        nstate = (state - certainRange[0]) / (certainRange[1] - certainRange[0])
    nstate = np.reshape(nstate, (1, screen_size, screen_size))
    return nstate

def int_map_to_onehot(x, vocabulary=None):
    if vocabulary is None:
        # If no vocabulary is known, make a conservative assumption
        vocabulary = set(x.flatten())
    output_shape = (len(vocabulary),) + x.shape
    output_map = np.zeros(shape=output_shape, dtype=float)
    for i, id in enumerate(vocabulary):
        output_map[i][x == id] = 1.
   # print(output_map)
    return output_map

    