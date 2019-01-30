import os
import sys
import platform
import subprocess

#def init_rpc(rpc_config):
def init_rpc():

    #args = rpc_config.command_args.clone()

    #launch_far_end(args)
    launch_far_end()

    #result = startup_module(rpc_config)

#def launch_far_end(command):
def launch_far_end():
    #configure for operating
    print("nothing for now")
    if (platform.system() == "Linux"):
        print("unix")
        subprocess.run(["firefox", "http://localhost:8000"])
        #subprocess.run(["xdg-open", "http://localhost:8000"])
        #subprocess.run("xdg-open http://localhost:8000", shell=True)

    elif (platform.system() == "Windows"):
        print("windows")
        subprocess.run(["start", "http://localhost:8000"])

    elif (platform.system() == "Darwin"):
        print("mac")
        subprocess.run(["open", "http://localhost:8000"])
    
    else:
        print("unrecognized system")
        sys.exit()

if __name__ == "__main__":
   init_rpc() 