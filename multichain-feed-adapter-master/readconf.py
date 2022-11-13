# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import configparser
import utils
import cfg


def is_missing(section, var):
    if var not in section:
        return True
    if section[var] is None:
        return True
    if len(section[var]) == 0:
        return True
    return False


def is_on(section, var):
    if is_missing(section, var):
        return False
    val=str(section[var]).lower()
    if val == 'on':
        return True
    if val == 'yes':
        return True
    if val == 'true':
        return True
    return False


def parse_argv(argv):

    args={}
    
    i = 0
    j = 0
    while i < len(argv):
        arg = argv[i]

        if arg[:2] == '--':
            split = arg[2:].split('=', 1)
            if len(split) == 1:
                args[split[0]] = True
            else:
                args[split[0]] = split[1]
        else:
            if j == 0:
                cfg.ini_file=arg
            elif j == 1:
                cfg.action=arg
            j += 1
            
        i += 1
        
    return args


def read_config_file(file_name):
    
    settings={}
    config = configparser.ConfigParser()
    try:
        config.read(file_name)
    except Exception as error:
        utils.print_error(error)
        return settings
    
    for section_name in config:
        section={}
        for var in config[section_name]:
            section[var]=config[section_name][var]
        settings[section_name]=section
    return settings


def read_conf(args):

    if len(cfg.ini_file) != 0:
        if cfg.ini_file[-4:] != ".ini":
            utils.print_error("Configuration file should have extension .ini")
            return False
                  
        cfg.ini_file=utils.file_dir_name(cfg.ini_file) + utils.file_file_name(cfg.ini_file)
        cfg.settings=read_config_file(cfg.ini_file)
        if len(cfg.settings) != 0:
            if 'main' not in cfg.settings:
                cfg.settings['main']={}
            cfg.settings['main']['ini_dir']=utils.file_dir_name(cfg.ini_file)
    else:
        cfg.settings={'main':{}}
        cfg.settings['main']['ini_dir']=utils.file_dir_name(__file__)
        
    for var in args:
        split = var.split('-', 1)
        if len(split) == 2:
            if split[0] not in cfg.settings:
                cfg.settings[split[0]] = {}
            cfg.settings[split[0]][split[1]]=args[var]
        
    if 'main' not in cfg.settings:
        utils.print_error("Missing main section")
        return False
        
    cfg.adapter_name=utils.file_file_name(cfg.ini_file)[:-4]
        
    if is_missing(cfg.settings['main'],'chain'):
        utils.print_error("Missing chain name")
        return False

    if is_missing(cfg.settings['main'],'feed'):
        utils.print_error("Missing feed name")
        return False

    if is_missing(cfg.settings['main'],'feed_dir'):
        cfg.settings['main']['feed_dir']="~/.multichain/" + cfg.settings['main']['chain'] + "/feeds/" + cfg.settings['main']['feed']
        
    cfg.feed_dir=utils.full_dir_name(cfg.settings['main']['feed_dir'])
         
    cfg.ini_dir=cfg.settings['main']['ini_dir']
    cfg.log_file=cfg.ini_dir + cfg.adapter_name + ".log"
    cfg.pid_file=cfg.ini_dir + cfg.adapter_name + ".pid"
        
    if 'output' not in cfg.settings:
        utils.print_error("Missing output section")
        return False

    cfg.selected={}
    
    for output in cfg.settings['output']:
        if is_on(cfg.settings['output'],output):
            if output not in cfg.settings:
                utils.print_error("Missing section for selected output " + str(output))
                return False
            cfg.selected[output]=cfg.settings[output].copy()

    if len(cfg.selected) == 0:
        utils.print_error("Output type not selected")
        return False
               
    for output in cfg.selected:
        if is_missing(cfg.settings[output],'type'):
            utils.print_error("Missing type for selected output " + str(output))
            return False
    
    return True


def check_file_config(config):

    if is_missing(config,'dir'):
        config['dir']=cfg.ini_dir
    config['dir']=utils.full_dir_name(config['dir'])
    
    if not utils.check_directory(config['dir']):
        utils.print_error("Couldn't create directory for output " + config["name"])
        return False
    
    if is_missing(config,'ptr'):
        config['ptr']=config['dir'] + config["name"] + ".ptr"
    if is_missing(config,'out'):
        config['out']=config['dir'] + config["name"] + ".out"

    return True


def check_db_config(config,allow_missing=False):
    
    if is_missing(config,'host'):
        config['host']='127.0.0.1'
    if is_missing(config,'dbname'):
        utils.print_error("Missing DB name")
        return False
    if is_missing(config,'user'):
        if allow_missing:
            config['user']=None
        else:
            utils.print_error("Missing DB user")
            return False
    if is_missing(config,'password'):
        if allow_missing:
            config['password']=None
        else:
            utils.print_error("Missing DB password")
            return False
    if is_missing(config,'pointer'):
        utils.print_error("Missing DB pointer")
        return False
        
    config['sql'] = None
    if not is_missing(config,'sql_output'):
        config['sql']=utils.file_dir_name(config['sql_output']) + utils.file_file_name(config['sql_output'])
        config['dir']=utils.file_dir_name(config['sql'])
        if not utils.check_directory(config['dir']):
            utils.print_error("Couldn't create directory for output " + config["name"])
            return False
            
    return True
