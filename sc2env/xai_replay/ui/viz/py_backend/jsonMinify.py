import sys
import json
import ntpath

def minify(filepath):
    filename = ntpath.basename(filepath)
    fileparts = filename.split(".")
    print(fileparts)
    fileroot = fileparts[0]
    fileext = fileparts[1]
    newfilename = fileroot + "_minified." + fileext
    with open(filepath) as json_file:
        json_string = json.load(json_file)
        json_minified = json.dumps(json_string, separators=(',', ':'))
        with open(newfilename, "w") as write_file:
            write_file.write(json_minified)

if __name__ == "__main__":
    minify(sys.argv[1])
