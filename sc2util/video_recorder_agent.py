from imutil import VideoMaker


class VideoRecorderAgent():
    def __init__(self, action_space):
        self.vid_rgb_screen = VideoMaker('rgb_screen')
        self.vid_rgb_map = VideoMaker('rgb_minimap')
        self.vid_feat_screen = VideoMaker('feature_screen')
        self.vid_feat_map = VideoMaker('feature_minimap')
        self.action_space = action_space

    def step(self, obs):
        rgb_minimap, rgb_screen, feature_minimap, feature_screen = obs
        self.vid_rgb_map.write_frame(rgb_minimap)
        self.vid_rgb_screen.write_frame(rgb_screen)
        self.vid_feat_map.write_frame(feature_minimap)
        self.vid_feat_screen.write_frame(feature_screen)
        return self.action_space.sample()

    def __del__(self):
        self.vid_rgb_screen.finish()
        self.vid_rgb_map.finish()
        self.vid_feat_screen.finish()
        self.vid_feat_map.finish()
