import sys
import os
import json

# looks at particular relative dir to see all files with appropriate extension - .xai - and 
#   returns a list of those filenames (not pathnames) for use in the browser dropdown list
def get_xai_replay_filenames():
    print("Do nothing for now")

    if (len(sys.argv) != 2):
        print("No file path given. Exiting...")
        sys.exit()
    dir_path = sys.argv[1]

    xai_file = []
    if os.path.isdir(dir_path):
        print("Directory specified grabbing all .xai files")
        all_files = os.listdir(dir_path)
        for i in all_files:
            if ".xai" in all_files[i]:
                xai_file.append(all_files[i])
                print(all_files[i])
                # *** To get the path ***
                # txt_answer_path = os.path.join(dir_path, txt_answer_file)
                # print(txt_answer_path)
    else:
        print("Directory given does not exist. Exiting...")
        sys.exit()

# loads the file as json string and returns it
# xai_file - a valid json object file
def get_json_for_replay(xai_file):
    json_string = json.loads(xai_file)
    return json_string

if __name__ == "__main__":
    get_xai_replay_filenames()
