
class XaiReplayRecorder():
    """
    Creates a video and metadata file to support XAI replays UI for user studies
    """
    game_clock_tick = 0

    def __init__(self):
        pass

    def record_decision_point(state, action, q_values, combined_q_values, reward):
        game_clock_tick = 0
        # take picture


    def record_game_clock_tick(state, reward):
        game_clock_tick += 1
        if (game_clock_tick % 17 == 0):
            #take picture