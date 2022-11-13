# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import sys
import signal
import time
import cfg
import readconf
import utils
import feed

adapter_app = "MultiChain Sample Feed Adapter"
adapter_version = "1.0"


def initialize_outputs():
    
    cfg.outputs=[]
    
    for output in cfg.selected:
        output_object=None
        
        split = cfg.selected[output]['type'].split('-', 1)
        
        mod_name="output-"+split[0]
        
        mod_file=utils.full_dir_name(utils.file_dir_name(__file__)) + mod_name + ".py"
        if not utils.file_exists(mod_file):
            error_str="Couldn't find module for output " + output
            utils.print_error(error_str)
            utils.log_error(error_str)
            return False
            
        try:
            if sys.version_info[1] >= 5:
                import importlib.util
                spec = importlib.util.spec_from_file_location(mod_name, mod_file)
                py_mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(py_mod)
            elif sys.version_info[1] < 5:
                import importlib.machinery
                loader = importlib.machinery.SourceFileLoader(mod_name, mod_file)
                py_mod = loader.load_module()            
        except Exception as e:
            utils.print_error(str(e))
            error_str="Unable to load module for output " + output
            utils.print_error(error_str)
            utils.log_error(error_str)
            return False
            
        if hasattr(py_mod, "AdapterOutput"):
            output_object = getattr(py_mod, "AdapterOutput")(output)
        else:
            error_str="Couldn't find class AdapterOutput for output " + output
            utils.print_error(error_str)
            utils.log_error(error_str)
            
        if not output_object.initialize():
            error_str="Unable to initialize output " + output
            utils.print_error(error_str)
            utils.log_error(error_str)
            return False
            
        utils.log_write("Output " + output + " open, read position: " + str(output_object.pointer))
        cfg.outputs.append(output_object)
                           
    for output1 in cfg.outputs:
        for output2 in cfg.outputs:
            if output1.name != output2.name:
                for param in ["ptr","out"]:
                    if (param in output1.config) and (param in output2.config):
                        if output1.config[param] == output2.config[param]:
                            error_str="Conflicting parameter {} in outputs {} and {}".format(param, output1, output2)
                            utils.print_error(error_str)
                            utils.log_error(error_str)
                            return False
                            
    return True


def close_outputs():
    """ Closes output objects."""
    for output in cfg.outputs:
        utils.log_write("Output " + output.name + " closed, read position: " + str(output.pointer))
    return True


def get_pointer():
    """ Retrieve minimal read pointer from all output objects."""
    ptr=(0x7FFFFFFF,0x7FFFFFFF)
    for output in cfg.outputs:
        if output.pointer<ptr:
            ptr=output.pointer
    return ptr


def next_pointer(this_ptr):
    """ Retrieve next to minimal read pointer from all output objects."""
    ptr=(0x7FFFFFFF,0x7FFFFFFF)
    for output in cfg.outputs:
        if output.pointer>this_ptr:
            if output.pointer<ptr:
                ptr=output.pointer
    return ptr


def update_outputs(records, new_ptr):
    """ Write to output objects."""
    for output in cfg.outputs:
        if output.pointer<new_ptr:
            if not output.write(records, new_ptr):
                error_str="Unable to write to output " + output.name
                utils.log_error(error_str)
                return False
    
    return True


def adapter_iteration():
    """ MultiChain Sample Feed Adapter iteration."""
    
    ptr=get_pointer()
    next_ptr=next_pointer(ptr)
    ptr_list=[ptr[0], ptr[1]]
    
    records=feed.read_records(ptr_list,next_ptr)
    
    if records is None:
        utils.log_error("Corrupted feed file")
        return False, False
    
    new_ptr=(ptr_list[0], ptr_list[1])
    
    if not update_outputs(records, new_ptr):
        utils.log_error("Couldn't write to outputs")
        return False, False
        
    if new_ptr != ptr:
        utils.log_write("New read position: " + str(new_ptr))
        return True, True
            
    return True, False


def term_signal_handler(signum, frame):
    cfg.action='term'


def main(argv):

    if len(argv) == 0:
        print ("""\nUsage: python3 -m adapter config-file.ini ( stop | daemon )

""" + adapter_app +""", version """ + adapter_version +"""

  config-file               Configuration file, see mcfeedadapter_example.conf for examples.
  action                    Optional, one of the following:
      stop                  Stop running adapter
      daemon                Start adapter as daemon
""")
        return 0

    print (adapter_app + """, version """ + adapter_version + "\n")
    print ("")
       
    args=readconf.parse_argv(argv)
    if cfg.action is not None:
        if cfg.action == 'daemon':
            utils.become_daemon();
        
    if not readconf.read_conf(args):
        return 1;

    if not initialize_outputs():
        close_outputs()
        return 1;
    
    current_pid=utils.file_read(cfg.pid_file)
       
    if cfg.action is not None:
        if (cfg.action == 'stop') or (cfg.action == 'status'):
            if current_pid is None:
                print("Adapter is not running\n")
                return 0
            process_id=int(current_pid)
            print("Adapter found, PID " + str(process_id))
            if cfg.action == 'stop':
                utils.remove_file(cfg.pid_file)
                while utils.is_process_running(process_id):
                    time.sleep(0.05)
                print("Adapter stopped\n")
            return 0

    if current_pid is not None:
        utils.print_error("Adapter for this feed is already running")
        return 1
    
    
    utils.file_write(cfg.pid_file,utils.get_pid())

    signal.signal(signal.SIGINT,term_signal_handler)
    signal.signal(signal.SIGTERM,term_signal_handler)
    
    current_pid=utils.file_read(cfg.pid_file)
    utils.log_write("Adapter started, PID: " + str(current_pid))
    while current_pid is not None:
        iteration_result=adapter_iteration()
        if cfg.action is not None:
            if cfg.action == 'term':
                utils.remove_file(cfg.pid_file)
                current_pid = None
                
        if current_pid is not None:
            if not iteration_result[0]:
                utils.print_error("Adapter encountered error when processing feed records and will be stopped")
                utils.remove_file(cfg.pid_file)
                return 1
            
            if not iteration_result[1]:
                time.sleep(0.1)
            
        current_pid=utils.file_read(cfg.pid_file)

    close_outputs()
    utils.log_write("Adapter stopped")


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
