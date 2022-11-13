# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


settings=None
selected=None
feed_dir=""
ini_dir=""
log_file=""
pid_file=""
adapter_name=""
action=None
ini_file=""
outputs=None


class BaseOutput:

    def __init__(self, name):
        self.name=name
        self.config = selected[name].copy()
        self.config["name"]=name
        self.pointer = (0, 0)

    def initialize(self):
        return True
        
    def write(self, records, ptr):
        return True

    def close(self):
        return True
