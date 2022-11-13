# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


record_header_size                                  = 5
field_header_size                                   = 5
int4_field_size                                     = 4
int4_full_field_size                                = 9

record_start_batch                                  = 0x01
record_end_batch                                    = 0x02
record_incomplete_batch                             = 0x03
record_previous_file                                = 0x04

field_size                                          = 0x01
field_file_id                                       = 0x02

# MultiChain events

event_block_remove_start                            = 0x23
event_block_remove_end                              = 0x24
event_block_add_start                               = 0x26
event_block_add_end                                 = 0x27

event_stream_item_received                          = 0x30
event_stream_item_confirmed                         = 0x31
event_stream_item_unconfirmed                       = 0x32
event_stream_item_invalid                           = 0x33
event_stream_offchain_available                     = 0x34
event_stream_offchain_purged                        = 0x35

# MultiChain fields

field_error_code                                    = 0x10
field_error_message                                 = 0x11

field_block_height                                  = 0x20
field_block_hash                                    = 0x21
field_block_tx_count                                = 0x22
field_block_time                                    = 0x23
field_block_miner                                   = 0x24
field_block_size                                    = 0x25

field_time_received                                 = 0x29
field_txid                                          = 0x2A
field_vout                                          = 0x2B
field_dataref                                       = 0x2C
field_offset_in_block                               = 0x2D

field_item_id                                       = 0x30
field_item_stream                                   = 0x32
field_item_publisher                                = 0x33
field_item_key                                      = 0x34
field_item_format                                   = 0x35
field_item_size                                     = 0x36
field_item_binary                                   = 0x37
field_item_text                                     = 0x38
field_item_json                                     = 0x3A
field_item_flags                                    = 0x3B

binary_fields     = [
                     field_block_hash,
                     field_txid,
                     field_dataref,
                     field_item_id,
                     field_item_binary
                    ]

integer_fields    = [
                     field_size,
                     field_file_id,
                     field_error_code,
                     field_block_height,
                     field_block_tx_count,
                     field_block_time,
                     field_block_size,
                     field_vout,
                     field_offset_in_block,
                     field_item_format,
                     field_item_size,
                     field_time_received,
                     field_item_flags
                    ]

timestamp_fields  = [
                     field_block_time,
                     field_time_received
                    ]


text_fields       = [
                     field_error_message,
                     field_block_miner,
                     field_item_stream,
                     field_item_text,
                    ]

json_fields      = [
                     field_item_json,
                    ]

array_fields     = [
                    field_item_key,
                    field_item_publisher
                   ]

def is_binary_field(field):
    return (field in binary_fields)

def is_integer_field(field):
    return (field in integer_fields)

def is_timestamp_field(field):
    return (field in timestamp_fields)

def is_text_field(field):
    return (field in text_fields)

def is_json_field(field):
    return (field in json_fields)

def is_array_field(field):
    return (field in array_fields)

def field_value(fields,field_name):
    if field_name in fields:
        return fields[field_name]
    return None

def format_value(fields):
    if field_item_format in fields:
        if fields[field_item_format] == 0:
            return 'binary'
        if fields[field_item_format] == 1:
            return 'text'
        if fields[field_item_format] == 2:
            return 'json'
    return 'unknown'


class MultiChainEvent():
    
    def __init__(self, fields):
        self.fields    = fields
        self.code      = 0
        self.table     = None
    
    def data(self,field_name):
        if field_name in self.fields:
            return self.fields[field_name]
        return None


class EventBlockAddStart(MultiChainEvent):
    
    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_block_add_start
        self.table     = None
        self.height    = self.data(field_block_height)
        self.hash      = self.data(field_block_hash)
        self.txcount   = self.data(field_block_tx_count)
        self.time      = self.data(field_block_time)
        self.miner     = self.data(field_block_miner)
        self.size      = self.data(field_block_size)


class EventBlockAddEnd(MultiChainEvent):
    
    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_block_add_end
        self.table     = None
        self.height    = self.data(field_block_height)
        self.hash      = self.data(field_block_hash)
        self.txcount   = self.data(field_block_tx_count)
        self.time      = self.data(field_block_time)
        self.miner     = self.data(field_block_miner)
        self.size      = self.data(field_block_size)


class EventBlockRemoveStart(MultiChainEvent):
    
    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_block_remove_start
        self.table     = None
        self.height    = self.data(field_block_height)
        self.hash      = self.data(field_block_hash)


class EventBlockRemoveEnd(MultiChainEvent):
    
    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_block_remove_end
        self.table     = None
        self.height    = self.data(field_block_height)
        self.hash      = self.data(field_block_hash)


class EventItemReceived(MultiChainEvent):

    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_stream_item_received
        self.table     = None
        self.id        = self.data(field_item_id)
        self.stream    = self.data(field_item_stream)
        self.txid      = self.data(field_txid)
        self.vout      = self.data(field_vout)
        self.publishers= self.data(field_item_publisher)
        self.keys      = self.data(field_item_key)
        self.format    = format_value(self.fields)
        self.size      = self.data(field_item_size)
        self.binary    = self.data(field_item_binary)
        self.text      = self.data(field_item_text)
        self.json      = self.data(field_item_json)
        self.received  = self.data(field_time_received)
        self.flags     = self.data(field_item_flags)
        self.dataref   = self.data(field_dataref)


class EventItemConfirmed(MultiChainEvent):

    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_stream_item_confirmed
        self.table     = None
        self.id        = self.data(field_item_id)
        self.stream    = self.data(field_item_stream)
        self.txid      = self.data(field_txid)
        self.vout      = self.data(field_vout)
        self.height    = self.data(field_block_height)
        self.hash      = self.data(field_block_hash)
        self.time      = self.data(field_block_time)
        self.offset    = self.data(field_offset_in_block)
        self.dataref   = self.data(field_dataref)


class EventItemUnconfirmed(MultiChainEvent):

    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_stream_item_unconfirmed
        self.table     = None
        self.id        = self.data(field_item_id)
        self.stream    = self.data(field_item_stream)
        self.txid      = self.data(field_txid)
        self.vout      = self.data(field_vout)


class EventItemInvalid(MultiChainEvent):

    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_stream_item_invalid
        self.table     = None
        self.id        = self.data(field_item_id)
        self.stream    = self.data(field_item_stream)
        self.txid      = self.data(field_txid)
        self.vout      = self.data(field_vout)


class EventOffchainAvailable(MultiChainEvent):

    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_stream_offchain_available
        self.table     = None
        self.id        = self.data(field_item_id)
        self.stream    = self.data(field_item_stream)
        self.format    = format_value(self.fields)
        self.size      = self.data(field_item_size)
        self.binary    = self.data(field_item_binary)
        self.text      = self.data(field_item_text)
        self.json      = self.data(field_item_json)
        self.received  = self.data(field_time_received)
        self.flags     = self.data(field_item_flags)
        self.dataref   = self.data(field_dataref)


class EventOffchainPurged(MultiChainEvent):

    def __init__(self, fields):
        self.fields    = fields
        self.code      = event_stream_offchain_purged
        self.table     = None
        self.id        = self.data(field_item_id)
        self.stream    = self.data(field_item_stream)
