import numpy as np
from rts_environment import RTSEnvironment
from random_agent import RandomAgent
import imutil


def main():
    env = RTSEnvironment()

    agent = RandomAgent(env.action_space())
    while True:
        initial_state = env.reset()
        action = agent.step(initial_state)

        before = np.concatenate([initial_state[2], initial_state[3]], axis=1)
        imutil.show(before, caption="Before")

        for _ in range(10):
            outcome_state, reward, done, info = env.step(action)

        after = np.concatenate([outcome_state[2], outcome_state[3]], axis=1)
        imutil.show(after, caption="After")
        minimap = outcome_state[0].mean(axis=0)
        imutil.show(minimap, resize_to=(256,256), caption="Minimap")
        import pdb; pdb.set_trace()


if __name__ == '__main__':
    main()
