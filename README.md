# PolyOps
Enable effective management and communication setup for Drones utilized in Construction, Logistics, Operations, Remote Water Monitoring, Sewage Management, Quality Assurance and Recyclability of Water in rivers.


Platform Features:

•Detection : Identifying the drones & UAVs in the video feed using object detection.

•Discovery : Logging the identities of the drones & UAVs flying in a particular air space at any instant of time, using exchange of unique identifiers.

•Geo-fencing : Discovering unlawful presence and raising alarms using the detection & discovery data.

•Monitoring : Looking out and reporting incidents based on event detection in visual data.

•Analysis : Analyzing route patterns and incidents.

•Drone Incident Reporting : Publish drone incident reports, preventive measures and remediation using a decentralized twitter application over the Ethereum blockchain network and Embark Tools.

We utilize the SAP UI5, Fiori platform, Arcana network, expert.ai nlp apis, IPFS/Filecoin via NFT.Storage, XMTP, Tableland to built the platform solution and Valist for distribution. We also utilized Ethereum blockchain for developing a decentralized rating and review system for drones used by infrastructure service providers. 

Our platform solution offers an Artificial Intelligence-based object detection system that utilizes blockchain solutions for sorting information obtained from a variety of drone cameras deployed at monitoring spots.

Our platform will provide the requisites features to share security conditions and remotely monitor the management policies in a place using used and broken phones and tablets, alarm clocks, internet connection, sync service, integration with IP cameras, raise safety alarms. The cost of deployment and added technology is limited which could help the businesses living in a variety of geographical regions. We also utilized google spreadsheets and its apis, google map APIs and telegram bot for developing monitoring and management application.

Expert.AI NL API: We are using expert.ai NL API for solving multiple challenges in investigative case management of UAVs for the admin role: sentiment analysis of a particular UAV incident for the admin role, social media text mining for a UAV incident and classification of the UAV incidents, early stage UAV incident reponse and prevention. We are using it for incident overview and assignment for the admin role too (please visit https://drive.google.com/file/d/1EKc_Cp_wYxp2SCux_WP8HdBXp2Du3kHT/view?usp=sharing ).

Please visit https://github.com/seetadev/PolyOps/tree/main/expert-ai-nlp

We have developed our solution based on a variety of blockchain protocols and solutions.

1a. Moralis Transaction Dashboard: We are developing an aggregated dashboard for all transfers and transactions using Moralis boilerplate as a reference.
Please visit the link at https://github.com/seetadev/PolyOps/tree/main/Moralis-Tx-Dashboard/Tx-Dashboard

1b. NFT.Storage for Filecoin: We are using NFT.Storage for storing a variety of offchain data like incident snapshots, alarm metadata and object types at the time of incident. Please find the video at https://drive.google.com/drive/folders/107GHYZVHIr867kV4abkQaWbeCrSrMwVN (screencapturewithoutsound.mov file). We are storing Alarm metadata using NFT.Storage. Also, Saving/deleting alarm metadata and image to/from IPFS using NFT.Storage. We are also storing the hash returned from IPFS to Ethereum test network using NFT.Storage. Further we are using NFT.Storage for: Video analytics configuration using NFT.Storage; Camera Management: Add/edit/delete cameras with integration with Livepeer, NFT.Storage; Live streaming with Object Detection Video Analytics using Livepeer for streaming, and NFT.Storage for snapshots.

1c. Vital Metadata on Filecoin Network: We are storing vital geofencing and additional monitoring data on Filecoin network. Please visit https://github.com/seetadev/PolyOps/tree/main/incidentalarmstorage/metadata-storage-on-filecoin 

Please visit: https://github.com/seetadev/PolyOps/tree/main/incidentalarmstorage

1d. Arcana network: We are utilizing Arcana network as a decentralized storage, privacy preserving platform for setting up the drone identification data and also geo location maps. We are also using it to develop guard rails on where the drones can fly in a region in order to prevent unauthorized flying or collison detection.

2. Tableland: We are developing monitoring notes platform for Drone and UAV administrators using Tableland. Please visit the app link at https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices/remoteislandmonitoring/Valist-Distribution/Monitoring-Notes

3. XMTP: We are implementing XMTP Chat for Drone administrators in a particular region with CyberConnect functions. Please visit the implementation link: https://github.com/seetadev/PolyOps/tree/main/XMTP-chat-CyberConnect/XMTPChat-CyberConnect

4. Aeternity: We are using Aeternity blockchain for scaling web3 solution:

a. NFT collection and NFTs on the æternity blockchain using the AEX-141 standard: We are extending the development on two use cases:

Unique NFTs (for unique assets)
Edition NFTs using templates (for mobility)

Please visit https://github.com/seetadev/PolyOps/tree/main/aeternity-solution/aex141-nft-collection/aex141-nft-collection-example-master

b. We are using AEproject to run a local dev environment & test ownable.aes and smartrealestate.aes Smart Contracts.

c. We are extending the development of ownables.aes (please visit https://github.com/seetadev/PolyOps/tree/main/aeternity-solution/aepp-sophia-ownables-assets/aepp-sophia-examples-master/contracts/Ownable ) and smartrealestate.aes (please visit https://github.com/seetadev/PolyOps/blob/main/aeternity-solution/aepp-sophia-ownables-assets/aepp-sophia-examples-master/contracts/SmartRealEstate/SmartRealEstate.aes) 


5. Polygon and Governance of Drones and UAVs using Aragon Plugins: A decentralized survey for drone ratings by users using a governance solution built with Aragon plugins at the core is done at key intervals and its onchain voting snapshots enable credibility of ratings. We can enable our smart contracts read the storage of any contract at a given block. This enables on-chain voting, airdrops on Ethereum and Polygon. Please visit https://github.com/seetadev/PolyOps/tree/main/Snapshots-DroneSurveyRatings


6. MultiChain: We are using MultiChain Feed Adapter for reading a feed and writing to MySQL powered Tableland blockchain database.
We are developing monitoring notes platform for Drone and UAV administrators using MYSQL powered Tableland. Please visit the app link at https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices/remoteislandmonitoring/Valist-Distribution/Monitoring-Notes

Please find the link to MultiChain Feed Adapter for writing to MySQL powered Tableland at https://github.com/seetadev/PolyOps/tree/main/multichain-feed-adapter-master
