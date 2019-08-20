import logging
import argparse
import os

from importlib import import_module
from abp.configs import NetworkConfig, ReinforceConfig, EvaluationConfig

from abp.examples.pysc2.tug_of_war.hra import run_task
from abp.examples.pysc2.tug_of_war.sadq_bigA import run_task as run_task_bigA
from abp.examples.pysc2.tug_of_war.sadq_2p import run_task as run_task_2p
from abp.examples.pysc2.tug_of_war.model_base_TS import run_task as run_task_mbts
from abp.examples.pysc2.tug_of_war.sadq_2p_2l import run_task as run_task_2p_2l
from abp.examples.pysc2.tug_of_war.sadq_2p_2l_grid import run_task as run_task_2p_2l_grid
from abp.examples.pysc2.tug_of_war.sadq_2p_2l_human_play import run_task as run_task_2p_2l_hp
from abp.examples.pysc2.tug_of_war.sadq_2p_2l_deexplanation import run_task as run_task_2p_2l_deexplanation
from abp.examples.pysc2.tug_of_war.sadq_2p_2l_grid_decomposed import run_task as run_task_2p_2l_grid_decomposed
from abp.examples.pysc2.tug_of_war.sadq_2p_2l_grid_decomposed_trans import run_task as run_task_2p_2l_grid_decomposed_trans
from abp.examples.pysc2.tug_of_war.model_base_TS_grid import run_task as run_task_mbts_grid

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
        '-tk', '--task',
        help="which task to run",
        dest='task',
        required=False
    )
    
    parser.add_argument(
        '--model',
        help="which model for agent",
        dest='agent_model',
        required=False
    )
    
    parser.add_argument(
        '-t', '--test',
        help='Just run test, no train',
        dest='test',
        action="store_true"
    )
    
    parser.add_argument(
        '-ce', '--collecting_experience',
        help='Just run test and collect experience',
        dest='collecting_experience',
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
    
    evaluation_config_path = os.path.join(args.folder, "evaluation.yml")
    evaluation_config = EvaluationConfig.load_from_yaml(evaluation_config_path)

    network_config_path = os.path.join(args.folder, "network.yml")
    network_config = NetworkConfig.load_from_yaml(network_config_path)

    reinforce_config_path = os.path.join(args.folder, "reinforce.yml")
    reinforce_config = ReinforceConfig.load_from_yaml(reinforce_config_path)

    if args.test:
        evaluation_config.training_episodes = 0
    if args.collecting_experience:
        reinforce_config.collecting_experience = True
        
    map_name = args.map
    if map_name is None:
        print("You are traning the agent for the default map: ")
        print("TugOfWar")
    else:
        print("You are traning the agent for the map: ")
        print(map_name)
    
    #print(map_name)
    if args.eval:
        evaluation_config.training_episodes = 0
        network_config.restore_network = True

    if args.render:
        evaluation_config.render = True

    if args.task == 'task_bigA':
        run_task_bigA(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever)
    elif args.task == 'task_single_player':
        run_task(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever)
    elif args.task == 'task_2p':
        run_task_2p(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever)
    elif args.task == 'task_mbts':
        run_task_mbts(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever)
    elif args.task == 'task_2p_2l':
        run_task_2p_2l(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever)
    elif args.task == 'task_2p_2l_grid':
        run_task_2p_2l_grid(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever)
    elif args.task == 'task_2p_2l_hp':
        run_task_2p_2l_hp(evaluation_config, network_config, reinforce_config, map_name = map_name, train_forever = args.train_forever, agent_model = args.agent_model)
    elif args.task == 'task_2p_2l_deexplanation':
        run_task_2p_2l_deexplanation(evaluation_config, network_config, reinforce_config, map_name = map_name, agent_model = args.agent_model)
    elif args.task == 'task_2p_2l_grid_decomposed':
        run_task_2p_2l_grid_decomposed(evaluation_config, network_config, reinforce_config, map_name = map_name)
    elif args.task == 'task_2p_2l_grid_decomposed_trans':
        run_task_2p_2l_grid_decomposed_trans(evaluation_config, network_config, reinforce_config, map_name = map_name)
    elif args.task == 'task_mbts_grid':
        run_task_mbts_grid(evaluation_config, network_config, reinforce_config, map_name = map_name)    
    else:
        print("need task")
    return 0


if __name__ == '__main__':
    main()
