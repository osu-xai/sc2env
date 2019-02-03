import logging
import argparse
import os

from importlib import import_module
from abp.configs import NetworkConfig, ReinforceConfig, EvaluationConfig

from abp.examples.pysc2.four_towers_friendly_units_group_dereward.hra import run_task

def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-f', '--folder',
        help='The folder containing the config files',
        required=True
    )
    parser.add_argument(
        '-m', '--map',
        help='Run the specified map',
        required=False
    )
    parser.add_argument(
        '-t', '--test',
        help='Just run test, no train',
        dest='test',
        action="store_true"
    )

    parser.add_argument(
        '-tf', '--train_forever',
        help='After reach optimal policy. No need more eposdes, train the agent train_forever',
        dest='train_forever',
        action="store_true"
    )
    parser.add_argument(
        '--eval',
        help="Run only evaluation task",
        dest='eval',
        action="store_true"
    )

    parser.add_argument(
        '-r', '--render',
        help="Render task",
        dest='render',
        action="store_true"
    )
    
    args = parser.parse_args()
    
    #print(args)
    #input()
    evaluation_config_path = os.path.join(args.folder, "evaluation.yml")
    evaluation_config = EvaluationConfig.load_from_yaml(evaluation_config_path)

    network_config_path = os.path.join(args.folder, "network.yml")
    network_config = NetworkConfig.load_from_yaml(network_config_path)

    reinforce_config_path = os.path.join(args.folder, "reinforce.yml")
    reinforce_config = ReinforceConfig.load_from_yaml(reinforce_config_path)

    if args.test:
        evaluation_config.training_episodes = 0
    map_name = args.map
    if map_name is None:
        print("You are traning the agent for the default map: ")
        print("FourTowesFriendlyunitsDecomposedGroupReward")
    else:
        print("You are traning the agent for the map: ")
        print(map_name)
    
    #print(map_name)
    if args.eval:
        evaluation_config.training_episodes = 0
        network_config.restore_network = True

    if args.render:
        evaluation_config.render = True


    run_task(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever)

    return 0


if __name__ == '__main__':
    main()
