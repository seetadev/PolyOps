# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import datetime
import cfg
import utils
import readconf
import multichain
import feed

event_names = {
               multichain.event_block_remove_start        : "Block remove start",
               multichain.event_block_remove_end          : "Block remove end",
               multichain.event_block_add_start           : "Block add start",
               multichain.event_block_add_end             : "Block add end",
               multichain.event_stream_item_received      : "New stream item",
               multichain.event_stream_item_confirmed     : "Stream item confirmed",
               multichain.event_stream_item_unconfirmed   : "Stream item unconfirmed",
               multichain.event_stream_item_invalid       : "Stream item invalid",
               multichain.event_stream_offchain_available : "Stream offchain item available",
               multichain.event_stream_offchain_purged    : "Stream offchain item purged"
              }

field_names = {
               multichain.field_error_code                : "Error code",
               multichain.field_error_message             : "Error message",
               multichain.field_block_height              : "Block height",
               multichain.field_block_hash                : "Block hash",
               multichain.field_block_tx_count            : "Block Tx count",
               multichain.field_block_time                : "Block timestamp",
               multichain.field_block_miner               : "Block miner address",
               multichain.field_block_size                : "Block size",
               multichain.field_time_received             : "Time received",
               multichain.field_txid                      : "Tx ID",
               multichain.field_vout                      : "Output ID",
               multichain.field_dataref                   : "Data reference",
               multichain.field_offset_in_block           : "Offset in block",
               multichain.field_item_id                   : "ID",
               multichain.field_item_stream               : "Stream",
               multichain.field_item_publisher            : "Publisher address",
               multichain.field_item_key                  : "Item key",
               multichain.field_item_format               : "Item format",
               multichain.field_item_size                 : "Item size",
               multichain.field_item_binary               : "Binary item data",
               multichain.field_item_text                 : "Text item data",
               multichain.field_item_json                 : "JSON item data",
               multichain.field_item_flags                : "Item flags"
              }



def event_name(code):
    
    if not code in event_names:
        return "Unknown event"
        
    return event_names[code]


def field_name(code):
    
    if not code in field_names:
        return "Unknown field"
        
    return field_names[code]


class AdapterOutput(cfg.BaseOutput):

    def initialize(self):
        
        if not readconf.check_file_config(self.config):
            return False

        self.pointer= utils.read_file_ptr(self.config)
                        
        return True

        
    def write(self, records, ptr):
        
        f = open(self.config['out'], "a")
        
        for record in records:
            fields=feed.parse_record(record,False)
            record_str=str(datetime.datetime.now()) + "\n"
            
            if self.config['type'] == "dump-hex":
                record_str="T: " + record_str
                
            f.write(record_str)
            
            record_str=""
            if self.config['type'] == "dump":
                record_str=event_name(record["code"]) + ", length: " +  str(record["length"]) + "\n"
            elif self.config['type'] == "dump-hex":
                record_str="R: {code:02x}: {length}\n".format(code = record["code"], length=record["length"])
            f.write(record_str)
            
            for field in fields:
                value=field["value"]
                if multichain.is_binary_field(field["code"]):
                    value=utils.bytes_to_hex(value)
                field_str="";
                if self.config['type'] == "dump":
                    field_str="   " + field_name(field["code"]) + ", length: " +  str(field["length"]) + ": " + str(value) + "\n"
                elif self.config['type'] == "dump-hex":
                    field_str="F: {code:02x}: ".format(code = field["code"]) + str(value) + "\n"
                        
                f.write(field_str)
            
        f.close
        
        self.pointer=ptr
        
        return utils.write_file_ptr(self.config,ptr)
        
                      
    def close(self):
        return True
