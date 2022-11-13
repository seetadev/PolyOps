# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import cfg
import utils
import readconf
import multichain
import feed

class AdapterOutput(cfg.BaseOutput):
    """ User defined output template class. """
 
    def initialize(self):
        """
            Class initialization.
            This class is implemented to do nothing except updating the feed read pointer.
            Updating feed read pointer is required, otherwise the adapter will try to
            send records to this class infinitely.
            The feed read pointer is stored in a file in this example.
    
            The following operations should be performed in this method:
            
            1. Check all required fields in the .ini file are present and set default values if needed.
            2. Read the feed read pointer.
            3. Make custom intitializations if necessary.
        """
    
        if not readconf.check_file_config(self.config):
            return False

        # access fields from the .ini file as named properties in self.config, e.g.
        # an .ini field named host is accessed as self.config['host']

        self.pointer=utils.read_file_ptr(self.config)
                        
        return True
 
        
    def write(self, records, ptr):
        """
            Writing feed data to this output.
            
            records - list of record objects:
            {
                'code'   : <event code> # see multichain.py for the list of events
                'length' : record length
                'data'   : record data
            }
            
            Use feed.parse_record(record) to parse the record. 
            
            feed.parse_record(record) returns parsed event object. The list of the fields depends on the event type.
                See Event* classes in multichain.py for details.            
            
            feed.parse_record(record,False) returns list of fields:
            {
                'code'   : <field code> # see multichain.py for the list of fields and field types
                'length' : field length
                'value'  : field value
                    bytes for binary fields
                    string for other types
                'intvalue' : integer field value for integer and timestamp fields
            }
                       
            ptr - feed read pointer - tuple ( file id, offset in file )
        """

        # Process records here
        
        for record in records:
            event=feed.parse_record(record)
            
            if not self.process_event(event):
                utils.log_error("Couldn't process event {code:02x} at ({file:4d}, {offset:08x})".format(code=record['code'],file=record['file'],offset=record['offset']))
                return False
                
        self.pointer=ptr
        
        return utils.write_file_ptr(self.config,ptr)
        
        
    def process_event(self,event):
        if event.code == multichain.event_block_add_start:
            # process block add event 
            pass
        elif event.code == multichain.event_block_remove_start:
            # process block remove event 
            pass
        elif event.code == multichain.event_stream_item_received:
            # process stream item received event
            pass
        elif event.code == multichain.event_stream_item_confirmed:
            # process stream item confirmed event
            pass
        elif event.code == multichain.event_stream_item_unconfirmed:
            # process stream item unconfirmed event
            pass
        elif event.code == multichain.event_stream_item_invalid:
            # process stream item invalid event
            pass
        elif event.code == multichain.event_stream_offchain_available:
            # process stream offchain available event
            pass
        elif event.code == multichain.event_stream_offchain_purged:
            # process stream offchain purged event
            pass
            
        return True


    def close(self):
        """ Close this object. """
        return True
