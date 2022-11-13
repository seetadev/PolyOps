# -*- coding: utf-8 -*-

# MultiChain Feed Adapter (c) Coin Sciences Ltd
# All rights reserved under BSD 3-clause license


import cfg
import psycopg2
import readconf
import multichain
import utils
import feed


class AdapterOutput(cfg.BaseOutput):

    def initialize(self):
        
        self.ptr_name=self.config['pointer']
        self.stream_table_names = {}
        self.checked_tables = {}
        
        if not readconf.check_db_config(self.config):
            return False
            
        self.sql_file=self.config['sql']
        self.conn_str="host=" + self.config['host'] + " dbname=" + self.config['dbname'] + " user=" + self.config['user'] + " password=" + self.config['password']
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
            "INSERT INTO pointers (pointer, file, pos) VALUES (%s,%s,%s) ON CONFLICT (pointer) DO UPDATE SET file=%s,pos=%s;",
            (self.ptr_name,ptr[0],ptr[1],ptr[0],ptr[1])
        )
            
        self.pointer=ptr
        
        return self.commit_transaction()
        
        
    def close(self):
        return True


    def create_pointer_table(self):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS pointers (pointer TEXT PRIMARY KEY, file INTEGER NOT NULL, pos INTEGER NOT NULL);"
        )
   
            
    def create_streammap_table(self):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS streams (stream TEXT PRIMARY KEY, dbtable TEXT NOT NULL);"
        )
    
        
    def create_blocks_table(self):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS blocks (hash BYTEA PRIMARY KEY,height INTEGER,confirmed TIMESTAMP,txcount INTEGER,size INTEGER,miner TEXT);"
        ) and  self.execute_creates(
            "CREATE INDEX IF NOT EXISTS blocks_height_idx ON blocks (height);"
        )
       
            
    def create_stream_table(self,stream_name,table_name):
        return self.execute_creates(
            "CREATE TABLE IF NOT EXISTS "+table_name+"""(id BYTEA PRIMARY KEY,txid BYTEA,vout INTEGER,publishers TEXT [],keys TEXT [],flags INTEGER,
                                                         size BIGINT,format VARCHAR(8),binary_data BYTEA,text_data TEXT,json_data JSON,dataref BYTEA,
                                                         received TIMESTAMP,confirmed TIMESTAMP,blockhash BYTEA,blockheight INTEGER,blockpos INTEGER);"""
        ) and self.execute_creates(
            "CREATE INDEX IF NOT EXISTS "+table_name+"_pos_idx ON "+table_name+" (blockheight,blockpos);"
        ) and self.execute_creates(
            "CREATE INDEX IF NOT EXISTS "+table_name+"_key_idx ON "+table_name+" (keys);"
        ) and self.execute_creates(
            "CREATE INDEX IF NOT EXISTS "+table_name+"_pub_idx ON "+table_name+" (publishers);"
        ) and self.execute_creates(
            "INSERT INTO streams (dbtable, stream) VALUES (%s,%s) ON CONFLICT (stream) DO NOTHING",
            (table_name,stream_name)
        )
    
    
    def event_block_add(self,event):
        if not self.check_blocks_table(event):
            return False
            
        return self.execute_sql(
            "INSERT INTO blocks (hash,height,txcount,confirmed,miner,size) VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT (hash) DO UPDATE SET txcount=%s,confirmed=%s,miner=%s,size=%s;",
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
            "INSERT INTO "+event.table+""" (id,txid,vout,publishers,keys,flags,received,size,format,binary_data,text_data,json_data,dataref) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO UPDATE SET flags=%s,received=%s,binary_data=%s,text_data=%s,json_data=%s,dataref=%s;""",
            (event.id,event.txid,event.vout,event.publishers,event.keys,event.flags,event.received,event.size,event.format,event.binary,event.text,event.json,event.dataref,
             event.flags,event.received,event.binary,event.text,event.json,event.dataref,)
        )
        
        
    def event_stream_item_confirmed(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "UPDATE "+event.table+" SET blockhash=%s,blockheight=%s,blockpos=%s,confirmed=%s,dataref=COALESCE(%s,dataref) WHERE id=%s",
            (event.hash,event.height,event.offset,event.time,event.dataref,event.id,)
        )


    def event_stream_item_unconfirmed(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "UPDATE "+event.table+" SET blockhash=NULL,blockheight=NULL,blockpos=NULL,confirmed=NULL WHERE id=%s",
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
            "UPDATE "+event.table+" SET binary_data=%s,text_data=%s,json_data=%s,flags=%s,received=%s,dataref=COALESCE(%s,dataref) WHERE id=%s",
            (event.binary,event.text,event.json,event.flags,event.received,event.dataref,event.id,)
        )


    def event_stream_offchain_purged(self,event):
        if not self.check_stream_table(event):
            return False
            
        return self.execute_sql(
            "UPDATE "+event.table+" SET binary_data=NULL,text_data=NULL,json_data=NULL,flags=flags & 254,dataref=NULL WHERE id=%s",
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
 
                
    def fetch_row(self,sql,params=()):
        
        try:
            conn=psycopg2.connect(self.conn_str)
        except (Exception, psycopg2.DatabaseError) as error:
            utils.log_error(str(error))
            return None
                
        row=()
        try:
            cur=conn.cursor()
            cur.execute(sql,params)
            if cur.rowcount > 0:
                row = cur.fetchone()
        except (Exception, psycopg2.DatabaseError) as error:
            pass
            
        if conn is not None:
            conn.close()
    
        return row


    def execute_transaction(self,sqls):
    
        result =True
        if len(sqls) == 0:
            return result

        f=None
        if self.sql_file != None:
            f = open(self.sql_file, "a")
        
        conn=None
        try:
            commit_required=False
            conn=psycopg2.connect(self.conn_str)
            cur=conn.cursor()
            
            for sql in sqls:
                if sql == "BEGIN;" or sql == "COMMIT;":
                    if f is not None:
                        f.write (str(sql,'utf-8') + "\n")
                    conn.commit()
                    commit_required=False
                else:
                    if isinstance(sql, tuple):
                        if f is not None:
                            f.write (str(cur.mogrify(sql[0],tuple(sql[1])),'utf-8')+ "\n")
                            f.write ("\n")
                        cur.execute(sql[0],tuple(sql[1]))
                    else:
                        if f is not None:
                            f.write (str(cur.mogrify(sql),'utf-8')+ "\n")
                        cur.execute(sql)
                    commit_required=True
            if commit_required:
                conn.commit()
                
            cur.close()
        except (Exception, psycopg2.DatabaseError) as error:
            utils.log_error(str(error))
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
