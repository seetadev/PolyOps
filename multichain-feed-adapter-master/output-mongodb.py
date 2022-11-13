# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import cfg
import pymongo
import datetime
import readconf
import multichain
import json
import utils
import feed


class AdapterOutput(cfg.BaseOutput):

    def initialize(self):
        
        self.ptr_name=self.config['pointer']
        self.stream_table_names = {}
        self.checked_tables = {}
        
        if not readconf.check_db_config(self.config,True):
            return False
            
        if readconf.is_missing(self.config,'port'):
            self.config['port']=27017
            
        if not self.check_pointer_table():
            utils.log_error("Couldn't create read pointers table")
            return False
              
        self.pointer = (0, 0)
        document=self.fetch_document("pointers",{"pointer":self.ptr_name})
        if document is not None:
            if "file" not in document or "pos" not in document:
                return False
            self.pointer = (document["file"], document["pos"])
            
        return True
   
        
    def write(self, records, ptr):
        
        if not self.begin_transaction():
            return False
            
        if not self.check_streammap_table():
            utils.log_error("Couldn't create stream mapping table")
            return False
                        
        for record in records:
            event=feed.parse_record(record)
            
            if not self.process_event(event):
                utils.log_error("Couldn't process event {code:02x} at ({file:4d}, {offset:08x})".format(code=record['code'],file=record['file'],offset=record['offset']))
                if event.table is None:
                    utils.log_error("Event record corrupted, ignored")
                else:
                    return False
                
        self.execute_upsert(
            "pointers",
            {"pointer":self.ptr_name},
            {"pointer":self.ptr_name},
            {"file":ptr[0],"pos":ptr[1]}
        )
        
        self.pointer=ptr
        
        return self.commit_transaction()
        
        
    def close(self):
        return True


    def create_pointer_table(self):
        return self.execute_create_collection("pointers",[{"fields":[("pointer",pymongo.ASCENDING)],"name":"pointers_idx","unique":True}])
   
            
    def create_streammap_table(self):
        return self.execute_create_collection("streams",[{"fields":[("stream",pymongo.ASCENDING)],"name":"streams_idx","unique":True}])
    
        
    def create_blocks_table(self):
        return self.execute_create_collection("blocks",[
            {"fields":[("hash",pymongo.ASCENDING)],"name":"blocks_hash_idx","unique":True},
            {"fields":[("height",pymongo.ASCENDING)],"name":"blocks_height_idx","unique":False}]
        )
       
            
    def create_stream_table(self,stream_name,table_name):
        return self.execute_create_collection(table_name,[
            {"fields":[("id",pymongo.ASCENDING)],"name":table_name+"_id_idx","unique":True},
            {"fields":[("keys",pymongo.ASCENDING)],"name":table_name+"_key_idx","unique":False},
            {"fields":[("publishers",pymongo.ASCENDING)],"name":table_name+"_pub_idx","unique":False},
            {"fields":[("blockheight",pymongo.ASCENDING),("blockpos",pymongo.ASCENDING)],"name":table_name+"_pos_idx","unique":False}]
        ) and self.execute_command(
            "streams",{"stream":stream_name},{"stream":stream_name},{"collection":table_name}
        )
    
    
    def event_block_add(self,event):
        if not self.check_blocks_table(event):
            return False
        
        return self.execute_upsert(
            "blocks",
            {"hash":event.hash},
            {"hash":event.hash,"height":event.height},
            {"txcount":event.txcount,"confirmed":event.time,"miner":event.miner,"size":event.size}
        )
    
    
    def event_block_remove(self,event):
        if not self.check_blocks_table(event):
            return False
            
        return self.execute_delete(
            "blocks",
            {"hash":event.hash}
        )
    
        
    def event_stream_item_received(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_upsert(
            event.table,
            {"id":event.id},
            {"id":event.id,"txid":event.txid,"vout":event.vout,"keys":event.keys,"publishers":event.publishers,"size":event.size,"format":event.format},
            {"flags":event.flags,"received":event.received,"binary_data":event.binary,"text_data":event.text,"json_data":event.json,"dataref":event.dataref}
        )
        

        
    def event_stream_item_confirmed(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_update(
            event.table,
            {"id":event.id},
            {"blockhash":event.hash,"blockheight":event.height,"blockpos":event.offset,"confirmed":event.time,"dataref":event.dataref},
        )
        


    def event_stream_item_unconfirmed(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_unset(
            event.table,
            {"id":event.id},
            {"blockhash":None,"blockheight":None,"blockpos":None,"confirmed":None},
        )


    def event_stream_item_invalid(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_delete(
            event.table,
            {"id":event.id},
        )


    def event_stream_offchain_available(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_update(
            event.table,
            {"id":event.id},
            {"flags":event.flags,"received":event.received,"binary_data":event.binary,"text_data":event.text,"json_data":event.json,"dataref":event.dataref}
        )
        

    def event_stream_offchain_purged(self,event):
        if not self.check_stream_table(event):
            return False
            
        document=self.fetch_document(event.table,{"id":event.id})
        
        if document is None:
            utils.log_error("Item with this id not found")
            return False

        if "flags" not in document:
            utils.log_error("Cannot find flags field for purged document")
            return False
            
        return self.execute_update(
            event.table,
            {"id":event.id},
            {"flags": (document["flags"] & 254)}
        ) and self.execute_unset(
            event.table,
            {"id":event.id},
            {"binary_data":None,"text_data":None,"json_data":None,"dataref":None},
        )
        

    def check_stream_table(self,event):
        
        if event.stream is None:
            return False
        
        stream_name=event.stream
        
        if stream_name not in self.stream_table_names:
            sanitized=self.sanitized_stream_name(stream_name)
            table_name=None
            
            document=self.fetch_document("streams",{"stream":stream_name})
            if document is not None:
                if "collection" not in document:
                    return False
                table_name=document["collection"]
                    
            if table_name is None:
                for ext in range(0,50):
                    try_name = sanitized
                    if ext > 0:
                        try_name += "_{ext:02d}".format(ext = ext)
                        
                    document=self.fetch_document("streams",{"collection":try_name})
                    if document is None:
                        table_name=try_name
                        break
                                    
            if table_name is None:
                utils.log_error("No available db table name found for stream " + stream_name)
                return False
                
            if not self.create_stream_table(stream_name,table_name):
                return False
                
            self.checked_tables[table_name]=True
            self.stream_table_names[stream_name]=table_name

        event.table=self.stream_table_names[stream_name]
        
        return True


    def check_pointer_table(self):
        if not 'pointers' in self.checked_tables:
            if not self.create_pointer_table():
                return False
            self.checked_tables['pointers']=True

        return True
    
    
    def check_streammap_table(self):
        if not 'streams' in self.checked_tables:
            if not self.create_streammap_table():
                return False
            self.checked_tables['streams']=True

        return True
    
    
    def check_blocks_table(self,event):
        if not 'blocks' in self.checked_tables:
            if not self.create_blocks_table():
                return False
            self.checked_tables['blocks']=True

        event.table='blocks'
        return True
         
        
    def process_event(self,event):
        if event.code == multichain.event_block_add_start:
            return self.event_block_add(event)
        elif event.code == multichain.event_block_remove_start:
            return self.event_block_remove(event)
        elif event.code == multichain.event_stream_item_received:
            return self.event_stream_item_received(event)
        elif event.code == multichain.event_stream_item_confirmed:
            return self.event_stream_item_confirmed(event)
        elif event.code == multichain.event_stream_item_unconfirmed:
            return self.event_stream_item_unconfirmed(event)
        elif event.code == multichain.event_stream_item_invalid:
            return self.event_stream_item_invalid(event)
        elif event.code == multichain.event_stream_offchain_available:
            return self.event_stream_offchain_available(event)
        elif event.code == multichain.event_stream_offchain_purged:
            return self.event_stream_offchain_purged(event)
            
        return True
 
 
    def connect(self):
        conn_string="mongodb://"+self.config['host']+":"+str(self.config['port'])
        if self.config['user'] is not None:
            if self.config['password'] is not None:
                conn=pymongo.MongoClient(conn_string,username=self.config['user'],password=self.config['password'],authSource=self.config['dbname'])
            else:
                conn=pymongo.MongoClient(conn_string,username=self.config['user'],authSource=self.config['dbname'])
        else:
            conn=pymongo.MongoClient(conn_string)
            
        return conn
    

    def getdb(self,conn):
        return conn[self.config['dbname']]
        
         
    def execute_transaction(self,commands):
        
        result=True
        if len(commands) == 0:
            return result

        conn=None
        try:
            conn=self.connect()
            db=self.getdb(conn)
            
            for command in commands:
                self.execute_mongodb_command(db,command)
                
        except pymongo.errors.PyMongoError as e:
            utils.log_error(str(e))
            result=False
            
        if conn is not None:
            conn.close()
                    
        return result


    def execute_create_collection(self,collection,indexes):
        result=True
        conn=None
        try:
            conn=self.connect()
            db=self.getdb(conn)
            coll=db[collection]
            for index in indexes:
                coll.create_index(index['fields'],name=index['name'],unique=index['unique'])
        except pymongo.errors.PyMongoError as e:
            utils.log_error(str(e))
            result=False
        
        if conn is not None:
            conn.close()
            
        return result
    

    def transform(self,values):
        result={}
        for field in values:            
            if values[field] is not None:
                if field == "json_data":
                    result[field]=json.loads(values[field])                
                elif isinstance(values[field], datetime.datetime):
                    result[field]=datetime.datetime.timestamp(values[field])
                elif isinstance(values[field], bytes):
                    result[field]=utils.bytes_to_hex(values[field])
                else:                
                    result[field]=values[field]
                    
        return result
    
    
    def execute_mongodb_command(self,db,command):
        coll=db[command[1]]
        
        if command[0] == "upsert":
            coll.update(self.transform(command[2]),{"$set":self.transform(command[4]),"$setOnInsert":self.transform(command[3])},upsert=True)
        elif command[0] == "update":
            coll.update(self.transform(command[2]),{"$set":self.transform(command[3])},upsert=False)
        elif command[0] == "unset":
            coll.update(self.transform(command[2]),{"$unset":command[3]},upsert=False)  
        elif command[0] == "delete":
            coll.delete_one(self.transform(command[2]))
            

    def execute_command(self,collection,query,insert_values,update_values):
        result=True
        conn=None
        try:
            conn=self.connect()
            db=self.getdb(conn)
            self.execute_mongodb_command(db,("upsert",collection,query,insert_values,update_values))
        except pymongo.errors.PyMongoError as e:
            utils.log_error(str(e))
            result=False
        
        if conn is not None:
            conn.close()
            
        return result
        
        
    def execute_upsert(self,collection,query,insert_values,update_values):
        self.commands.append(("upsert",collection,query,insert_values,update_values))
        return True


    def execute_update(self,collection,query,update_values):
        self.commands.append(("update",collection,query,update_values))
        return True
        

    def execute_unset(self,collection,query,unset_values):
        self.commands.append(("unset",collection,query,unset_values))
        return True
        
        
    def execute_delete(self,collection,query):
        self.commands.append(("delete",collection,query))
        return True

                
    def fetch_document(self,collection,query):
        result=None
        try:
            conn=self.connect()
            db=self.getdb(conn)
            coll=db[collection]
            result=coll.find_one(self.transform(query))
        except pymongo.errors.PyMongoError as e:
            utils.log_error(str(e))
        
        if conn is not None:
            conn.close()

        return result
        
    def begin_transaction(self):
        self.commands=[]
        return True


    def commit_transaction(self):
        result=self.execute_transaction(self.commands)
        self.commands=[]
        return result

        
    def abort_transaction(self):
        self.commands=[]
        return True


    def sanitized_stream_name(self,stream_name):
        if stream_name == 'blocks':
            return 'blocks_stream'
        if stream_name == 'streams':
            return 'streams_stream'
        if stream_name == 'pointers':
            return 'pointers_stream'
            
        sanitized="".join([ c if c.isalnum() else "_" for c in stream_name ])
        sanitized=sanitized.lower()
        if not sanitized[0].isalpha():
            sanitized = "ref_" + sanitized
        
        return sanitized[0:20]
    
