import time

class Timer():
    def __init__(self, message):
        self.message = message
        print('{}...'.format(message))

    def __enter__(self):
        self.start_time = time.time()

    def __exit__(self, type, value, traceback):
        duration = time.time() - self.start_time
        print('\t...completed {} in {:.03f} sec'.format(self.message, duration))
