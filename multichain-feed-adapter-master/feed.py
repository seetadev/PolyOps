# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import os
import cfg
import multichain
import datetime
import utils

max_records_in_iteration=10


def out_error(file_id, offset, comment=""):
    utils.log_error("Feed data corrupted in file " + str(file_id) + ", offset " + str(offset) + ": " + comment)


def read_records(ptr_list,next_ptr):
    
    records=[]
    
    feed_file_name=cfg.feed_dir + "feed{:06d}.dat".format(ptr_list[0])
    if not os.path.isfile(feed_file_name):
        return records
    
    count=0
    offset=ptr_list[1]
    take_batch=True
    f = open(feed_file_name, "rb")
    f.seek(offset)
    statinfo = os.stat(feed_file_name)
    file_len=statinfo.st_size
    next_file=ptr_list[0]
    while take_batch:
        
        if file_len >= offset + multichain.record_header_size + multichain.int4_full_field_size:
            
            rec_code=utils.file_read_char(f)
            if rec_code == multichain.record_start_batch:                
                if utils.file_read_int32(f) != multichain.int4_full_field_size:
                    out_error(next_file,offset,"Start batch record size")
                    return None
                if utils.file_read_char(f) != multichain.field_size:
                    out_error(next_file,offset,"Start batch field type")
                    return None
                if utils.file_read_int32(f) != multichain.int4_field_size:
                    out_error(next_file,offset,"Start batch field size")
                    return None
                    
                batch_len=utils.file_read_int32(f)
                offset += batch_len
                rec_offset=offset
                rec_code=utils.file_read_char(f)
                while rec_code != multichain.record_end_batch:
                    
                    record={}
                    record["code"]=rec_code
                    rec_len=utils.file_read_int32(f)
                    record["length"]=rec_len
                    record["file"]=next_file
                    record["offset"]=rec_offset
                    
                    rec_data=""
                    if rec_len > 0:
                        rec_data=f.read(rec_len)
                    record["data"]=rec_data
                    
                    count += 1
                    records.append(record)
                    rec_code=utils.file_read_char(f)
                    rec_offset+=rec_len+multichain.record_header_size
                
                end_len=utils.file_read_int32(f)
                if (end_len != multichain.int4_full_field_size) and (end_len != 2 * multichain.int4_full_field_size):
                    out_error(next_file,offset,"End batch record size")
                    return None
                if utils.file_read_char(f) != multichain.field_size:
                    out_error(next_file,offset,"End batch field type")
                    return None
                if utils.file_read_int32(f) != multichain.int4_field_size:
                    out_error(next_file,offset,"End batch field size")
                    return None
                no_headers_batch_len=utils.file_read_int32(f)
                if (no_headers_batch_len != batch_len - end_len - multichain.record_header_size):
                    out_error(next_file,offset,"End batch field value")
                    return None
                    
                if end_len > multichain.int4_full_field_size:
                    if utils.file_read_char(f) != multichain.field_file_id:
                        out_error(next_file,offset,"Next file field type")
                        return None
                    if utils.file_read_int32(f) != multichain.int4_field_size:
                        out_error(next_file,offset,"Next file field size")
                        return None
                        
                    next_file=utils.file_read_int32(f)
                    offset=0
                    take_batch=False
                    
            elif rec_code == multichain.record_previous_file:
                rec_len=utils.file_read_int32(f)
                if (rec_len != 3 * multichain.int4_full_field_size):
                    out_error(next_file,offset,"Prev file record size")
                    return None
                f.read(rec_len)
                offset += multichain.record_header_size + rec_len
                
            elif rec_code == multichain.record_incomplete_batch:
                take_batch=False
                
            else:
                take_batch=False
        else:
            take_batch=False
        
        if len(records) > max_records_in_iteration:
            take_batch=False
        if (next_file,offset) >= next_ptr:
            take_batch=False
                
    f.close
    
    ptr_list[0]=next_file
    ptr_list[1]=offset
    
    return records


def parse_record(record, full=True):
    
    rec_len=record["length"]
    offset = 0
    raw=[]
    while offset < rec_len:
        
        field={}
        field["code"]=record["data"][offset]
        field["length"]=utils.bytes_to_int32(record["data"][(offset+1):(offset+5)])
        offset += multichain.field_header_size
        
        field["value"]="Undefined"
        
        if multichain.is_binary_field(field["code"]):
            field["value"]=record["data"][offset : (offset+field["length"])]
            
        if (multichain.is_text_field(field["code"])) or (multichain.is_json_field(field["code"])) :
            try:
                field["value"]=str(record["data"][offset : (offset+field["length"])],'utf-8')
            except:
                field["value"]=None
            
        if multichain.is_array_field(field["code"]):
            try:
                field["value"]=str(record["data"][offset : (offset+field["length"])],'utf-8')
            except:
                field["value"]=None
            
        if multichain.is_integer_field(field["code"]):
            
            if field["length"] == 1:
                field["intvalue"]=record["data"][offset]
                
            if field["length"] == 4:
                field["intvalue"]=utils.bytes_to_int32(record["data"][(offset):(offset+4)])
                
            elif field["length"] == 8:
                field["intvalue"]=utils.bytes_to_int64(record["data"][(offset):(offset+8)])
            
#            if "intvalue" in field:
#                field["value"]=str(field["intvalue"])
            field["value"]=field["intvalue"]
            if multichain.is_timestamp_field(field["code"]):
                field["value"]=datetime.datetime.fromtimestamp(field["intvalue"])

        if field["value"] is not None:
            raw.append(field)
        
        offset += field["length"]

    if not full:
        return raw

    fields={}
    
    for field in raw:
        if "intval" in field:
            fields[field["code"]]=field["intval"]
        else:
            if multichain.is_array_field(field["code"]):
                if field["code"] not in fields:
                    fields[field["code"]]=[]
                fields[field["code"]].append(field["value"])
            else:
                fields[field["code"]]=field["value"]

    if record["code"] == multichain.event_block_add_start:
        return multichain.EventBlockAddStart(fields)

    if record["code"] == multichain.event_block_add_end:
        return multichain.EventBlockAddEnd(fields)
        
    if record["code"] == multichain.event_block_remove_start:
        return multichain.EventBlockRemoveStart(fields)
        
    if record["code"] == multichain.event_block_remove_end:
        return multichain.EventBlockRemoveEnd(fields)
        
    if record["code"] == multichain.event_stream_item_received:
        return multichain.EventItemReceived(fields)
        
    if record["code"] == multichain.event_stream_item_confirmed:
        return multichain.EventItemConfirmed(fields)
        
    if record["code"] == multichain.event_stream_item_unconfirmed:
        return multichain.EventItemUnconfirmed(fields)
        
    if record["code"] == multichain.event_stream_item_invalid:
        return multichain.EventItemInvalid(fields)
        
    if record["code"] == multichain.event_stream_offchain_available:
        return multichain.EventOffchainAvailable(fields)
        
    if record["code"] == multichain.event_stream_offchain_purged:
        return multichain.EventOffchainPurged(fields)
    
    unknown = multichain.MultiChainEvent(fields)
    unknown.code = record["code"]
    
    return unknown
