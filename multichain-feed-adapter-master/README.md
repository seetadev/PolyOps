MultiChain Feed Adapter
=======================

[MultiChain Enterprise](https://www.multichain.com/enterprise/) feeds are real-time binary logs that make it easy to reflect the contents of a blockchain to any external database. A feed can contain information about the blocks in the chain, and the items in one or more streams (including unconfirmed transactions). Detailed documentation of the [feed file format](https://www.multichain.com/developers/feed-file-format/) is available.

The [MultiChain Feed Adapter](https://github.com/MultiChain/multichain-feed-adapter) is a free and open source Python tool for reading a feed and writing to several popular databases. This adapter is licensed under the 3-clause BSD license, which is very liberal. You are free to fork and modify it for your own purposes, including:

* Adding support for additional databases.
* Only writing some records to the database.
* Transforming the data before it is written.


System Requirements
-------------------

* Any modern 64-bit Linux.
* MultiChain Enterprise 2.0.5 Demo/Beta 1 or later.
* Python 3.
* If using the built-in database support, one of: PostgreSQL 9.2+, MySQL/MariaDB 5.5+, MongoDB 2.4+.


Getting Started
---------------

1. Make sure you are running [MultiChain Enterprise](https://www.multichain.com/enterprise/) (you can [download a free demo](https://www.multichain.com/download-enterprise/)).

2. If you have not already created a blockchain and one or more streams on that chain, you can do so by following the [Getting Started](https://www.multichain.com/getting-started/) guide. A single node is enough to get started with feeds.

3. Open the command-line tool for your blockchain node, substituting `chain1` for the chain name:

	`multichain-cli chain1`

4. Create a feed on your blockchain, by running this in the command-line tool:

	`createfeed feed1`
    
5. If you want the target database to reflect the contents of a stream, add it to the feed by substituting the stream name below. The node does not need to be subscribed to the stream itself. Any number of streams can be added and each will create a separate database table:

	`addtofeed feed1 stream1`
    
6. If you want the target database to include a table of blocks, add them to the feed as follows:

	`addtofeed feed1 '' blocks`
    
7. Create the target database and note down the host and database name, as well as any other credentials required for accessing the database.

8. In the Linux command line, make a copy of the appropriate `example-config-*.ini` file, for example:

	`cp example-config-postgres.ini config.ini`
	
9. Use your favorite text editor to edit the new `config.ini` file as follows:

* Set `chain` to the name of your blockchain.
* Set `feed` to the name of the feed you created.
* Set any other parameters required for your target database.

10. In the Linux command line, start the adapter to begin synchronizing the feed to the database:

	`python3 adapter.py config.ini daemon`
	
11.	Explore the data that was written in your database in the usual way. Based on the information in the feed file, the adapter will automatically create the appropriate tables, along with some useful indexes. You are free to add more indexes, views, etc... to suit your requirements.

12. At any time the adapter can be stopped and restarted from the Linux command line as follows:

	`python3 adapter.py config.ini stop`

	`python3 adapter.py config.ini daemon`


MultiChain Feed APIs
--------------------
	
Below is a brief summary of the JSON-RPC APIs in MultiChain Enterprise relating to feeds. There is more detailed [API documentation online](https://www.multichain.com/developers/json-rpc-api/) online, or type `help <command>` in the MultiChain command line.

* `createfeed`, `deletefeed` and `listfeeds` create, delete and list the configured feeds (there is no limit).
* `addtofeed` and `updatefeed` configure a feed's contents, set options and provide flow control.
* `pausefeed` and `resumefeed` globally pause and resume a feed, using a temporary buffer to not lose events.
* `getdatarefdata` and `datareftobinarycache` retrieve large pieces of data not written in full to a feed.
* `purgefeed` removes old feed files in order to free up disk space.


Controlling Disk Usage
----------------------

For maximum reliability and durability, a MultiChain feed is an append-only log, which is written to disk in consecutively numbered files. As a result, over time, a feed can use up considerable disk space. In order to reduce disk usage, the following steps can be taken:

* Call the `purgefeed` JSON-RPC API periodically to remove old feed files after they have been processed.
* Use the `maxshowndata` feed option (default value: 16K) to set the maximum size of a stream item's payload to be embedded in a feed file. The full data for any item can always be obtained using the `getdatarefdata` and `datareftobinarycache` APIs, since the `dataref` for every stream item is included in the feed.
* For advanced users only: Remove unwanted events and event fields by setting feed options in the `addtofeed` and `updatefeed` APIs. Run `help feed-options` in the command-line tool to see a full list.


Modifying the Adapter
---------------------

To add support for a new database, make a copy of `output-usertype.py` called `output-whatever.py` (replacing `whatever` with your database name) and start modifying it. There are comments within the file which provide guidance on where to add your code for initializing the database and processing the different types of events.

Your code must be able to cope with duplicate blocks or stream items in a feed. This can happen because of a node stopping and restarting, or a requested feed or blockchain rescan. You can search for `ON CONFLICT` in `output-postgres.py` to see detailed examples of how to deal with these duplicates, by updating certain database columns only.

Activate your `output-whatever.py` file in an output section of the `.ini` file by setting `type = whatever`. All other parameters in the same output section are available to your code. If the `type` in the `.ini` file contains a hyphen (`-`), only the text before the hyphen determines the `output-...py` file loaded.

You can also copy the included code and modify it for your needs. For example, you might only need to write certain types of stream items to the database, or perform some transformation on the data before it is written.