# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import cfg
import pymysql
import readconf
import multichain
import utils
import feed

import warnings
warnings.filterwarnings("ignore", category = pymysql.Warning)

class AdapterOutput(cfg.BaseOutput):

    def initialize(self):
        
        self.ptr_name=self.config['pointer']
        self.stream_table_names = {}
        self.checked_tables = {}
        
        if not readconf.check_db_config(self.config):
            return False
            
        if readconf.is_missing(self.config,'port'):
            self.config['port']=3306
            
        self.sql_file=self.config['sql']
        if not self.check_pointer_table():
            utils.log_error("Couldn't create read pointers table")
            return False
              
        row=self.fetch_row(
            "SELECT file, pos FROM pointers WHERE pointer=%s;",
            (self.ptr_name,)
        )
            
        if row is None:
            return False
            
        self.pointer = (0, 0)
        if len(row) > 0:
            self.pointer = (row[0], row[1])
            
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
                
        self.execute_sql(
            "INSERT INTO pointers (pointer, file, pos) VALUES (%s,%s,%s) ON DUPLICATE KEY UPDATE file=%s,pos=%s;",
            (self.ptr_name,ptr[0],ptr[1],ptr[0],ptr[1])
        )
            
        self.pointer=ptr
        
        return self.commit_transaction()
        
        
    def close(self):
        return True


    def create_pointer_table(self):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS pointers (pointer VARCHAR(64) PRIMARY KEY, file INTEGER NOT NULL, pos INTEGER NOT NULL) CHARACTER SET utf8;"
        )
   
            
    def create_streammap_table(self):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS streams (stream VARCHAR(32) PRIMARY KEY, dbtable VARCHAR(32) NOT NULL) CHARACTER SET utf8;"
        )
    
        
    def create_blocks_table(self):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS blocks (hash BINARY(32) PRIMARY KEY,height INTEGER,confirmed TIMESTAMP NULL,txcount INTEGER,size INTEGER,miner VARCHAR(64), index blocks_height_idx (height)) CHARACTER SET utf8;"
        )
       
            
    def create_stream_table(self,stream_name,table_name):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS "+table_name+"""(id BINARY(20) PRIMARY KEY,txid BINARY(32),vout INTEGER,flags INTEGER,
                                                         size BIGINT,format VARCHAR(8),binary_data LONGBLOB,text_data LONGTEXT,json_data LONGTEXT,dataref BINARY(40),
                                                         received TIMESTAMP NULL,confirmed TIMESTAMP NULL,blockhash BINARY(32),blockheight INTEGER,blockpos INTEGER,
                                                         index """ + table_name + "_pos_idx (blockheight,blockpos)) CHARACTER SET utf8; """
        ) and self.execute_creates(
             "CREATE TABLE IF NOT EXISTS "+table_name+"_key (id BINARY(20) NOT NULL,itemkey VARCHAR(256) NOT NULL,PRIMARY KEY (id,itemkey(255)),"+
                                                      "index "+table_name+"_key_idx (itemkey(255)),"+
                                                      "CONSTRAINT "+table_name+"_key_fk_id FOREIGN KEY (id) REFERENCES "+table_name+" (id) ON DELETE CASCADE) CHARACTER SET utf8;"
        ) and self.execute_creates(
             "CREATE TABLE IF NOT EXISTS "+table_name+"_pub (id BINARY(20) NOT NULL,publisher VARCHAR(190) NOT NULL,PRIMARY KEY (id,publisher),"+
                                                      "index "+table_name+"_pub_idx (publisher),"+
                                                      "CONSTRAINT "+table_name+"_pub_fk_id FOREIGN KEY (id) REFERENCES "+table_name+" (id) ON DELETE CASCADE) CHARACTER SET utf8;"
        ) and self.execute_creates(
            "INSERT INTO streams (dbtable, stream) VALUES (%s,%s) ON DUPLICATE KEY UPDATE dbtable=dbtable",
            (table_name,stream_name)
        )
    
    
    def event_block_add(self,event):
        if not self.check_blocks_table(event):
            return False
            
        return self.execute_sql(
            "INSERT INTO blocks (hash,height,txcount,confirmed,miner,size) VALUES (%s,%s,%s,%s,%s,%s) ON DUPLICATE KEY UPDATE txcount=%s,confirmed=%s,miner=%s,size=%s;",
            (event.hash,event.height,event.txcount,event.time,event.miner,event.size,event.txcount,event.time,event.miner,event.size,)
        )
    
    
    def event_block_remove(self,event):
        if not self.check_blocks_table(event):
            return False
            
        return self.execute_sql(
            """DELETE FROM blocks WHERE hash=%s;""",
            (event.hash,)
        )
    
        
    def event_stream_item_received(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "INSERT INTO "+event.table+""" (id,txid,vout,flags,received,size,format,binary_data,text_data,json_data,dataref) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE flags=%s,received=%s,binary_data=%s,text_data=%s,json_data=%s,dataref=%s;""",
            (event.id,event.txid,event.vout,event.flags,event.received,event.size,event.format,event.binary,event.text,event.json,event.dataref,
             event.flags,event.received,event.binary,event.text,event.json,event.dataref,)
        ) and self.event_stream_item_received_keys(event) and self.event_stream_item_received_publishers(event)
        
        
    # Not using INSERT IGNORE in the functions below because this would hide other errors we want reported.
        
    def event_stream_item_received_keys(self,event):
        if event.keys is None:
            return True
        
        
        for key in event.keys:
            if not self.execute_sql("INSERT INTO "+event.table+"_key (id,itemkey) VALUES (%s,%s) ON DUPLICATE KEY UPDATE id=id;",(event.id,key,)):
                 return False

        return True
        

    def event_stream_item_received_publishers(self,event):
        if event.publishers is None:
            return True
        
        for publisher in event.publishers:
            if not self.execute_sql("INSERT INTO "+event.table+"_pub (id,publisher) VALUES (%s,%s) ON DUPLICATE KEY UPDATE id=id;",(event.id,publisher,)):
                 return False

        return True
        
        
    def event_stream_item_confirmed(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "UPDATE "+event.table+" SET blockhash=%s,blockheight=%s,blockpos=%s,confirmed=%s,dataref=COALESCE(%s,dataref) WHERE id=%s;",
            (event.hash,event.height,event.offset,event.time,event.dataref,event.id,)
        )


    def event_stream_item_unconfirmed(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "UPDATE "+event.table+" SET blockhash=NULL,blockheight=NULL,blockpos=NULL,confirmed=NULL WHERE id=%s;",
            (event.id,)
        )


    def event_stream_item_invalid(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "DELETE FROM "+event.table+" WHERE id=%s;",
            (event.id,)
        )


    def event_stream_offchain_available(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "UPDATE "+event.table+" SET binary_data=%s,text_data=%s,json_data=%s,flags=%s,received=%s,dataref=COALESCE(%s,dataref) WHERE id=%s;",
            (event.binary,event.text,event.json,event.flags,event.received,event.dataref,event.id,)
        )


    def event_stream_offchain_purged(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "UPDATE "+event.table+" SET binary_data=NULL,text_data=NULL,json_data=NULL,flags=flags & 254,dataref=NULL WHERE id=%s;",
            (event.id,)
        )


    def check_stream_table(self,event):
        
        if event.stream is None:
            return False
        
        stream_name=event.stream
        
        if stream_name not in self.stream_table_names:
            sanitized=self.sanitized_stream_name(stream_name)
            table_name=None
            
            row=self.fetch_row(
                "SELECT dbtable, stream FROM streams WHERE stream=%s;",
                (stream_name,)
            )
            if row is None:
                return False
            
            if len(row) > 0:
                table_name=row[0]
                    
            if table_name is None:
                for ext in range(0,50):
                    try_name = sanitized
                    if ext > 0:
                        try_name += "_{ext:02d}".format(ext = ext)
                    row=self.fetch_row(
                        "SELECT dbtable, stream FROM streams WHERE dbtable=%s;",
                        (try_name,)
                    )
                    if row is None:
                        return False
                        
                    if len(row) == 0:
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
        conn=pymysql.connect(host=self.config['host'],user=self.config['user'],passwd=self.config['password'],db=self.config['dbname'],port=self.config['port'])
        return conn
        
 
    def fetch_row(self,sql,params=()):
        
        try:
            conn=self.connect()
        except pymysql.Error as e:
            utils.log_error(str(e.args[1]))
            return None
                
        row=()
        try:
            cur=conn.cursor()
            cur.execute(sql,params)
            if cur.rowcount > 0:
                row = cur.fetchone()
        except pymysql.Error as e:
            pass
            
        if conn is not None:
            conn.close()
    
        return row


    def replace_sql_binaries(self,raw_sql):                
        toHex = lambda x:''.join(format(c, '02x') for c in x)
        params=()
        head=""
        tail=raw_sql[0]
        for param in raw_sql[1]:
            parts = tail.split("%s",1)
            head += parts[0]
            if isinstance(param, bytes):
                head += "UNHEX('" + toHex(param) + "')"
            else:
                head += "%s"
                params += (param,)
            tail = parts[1]
        return (head+tail,params)

        
    def execute_transaction(self,sqls):
        
        result=True
        if len(sqls) == 0:
            return result

        f=None
        if self.sql_file != None:
            f = open(self.sql_file, "a")
        
        conn=None
        try:
            commit_required=False
            conn=self.connect()
            cur=conn.cursor()
            
            for raw_sql in sqls:
                if raw_sql == "BEGIN;" or raw_sql == "COMMIT;":
                    if f is not None:
                        f.write (str(raw_sql,'utf-8') + "\n")
                    conn.commit()
                    commit_required=False
                else:
                    if isinstance(raw_sql, tuple):
                        sql=self.replace_sql_binaries(raw_sql)
                        cur.execute(sql[0],tuple(sql[1]))
                        if f is not None:
                            f.write (cur._last_executed)
                            f.write ("\n")
                    else:
                        cur.execute(sql)
                        if f is not None:
                            f.write (cur._last_executed)
                            f.write ("\n")
                    commit_required=True
            if commit_required:
                conn.commit()
                
            cur.close()
        except pymysql.Error as e:
            utils.log_error(str(e.args[1]))
            result=False
        if conn is not None:
            conn.close()
        
        if f is not None:
            f.close
            
        return result


    def execute_creates(self,sql,params=()):
        return self.execute_transaction([(sql,params)])

        
    def execute_sql(self,sql,params=()):
        self.sqls.append((sql,params))
        return True

        
    def begin_transaction(self):
        self.sqls=[]
        return True


    def commit_transaction(self):
        result=self.execute_transaction(self.sqls)
        self.sqls=[]
        return result

        
    def abort_transaction(self):
        self.sqls=[]
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
    
