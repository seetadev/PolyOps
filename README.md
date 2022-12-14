# PolyOps
Enable effective management and communication setup for Drones utilized in Construction, Logistics, Operations, Remote Water Monitoring, Sewage Management, Quality Assurance and Recyclability of Water in rivers.


Platform Features:

•Detection : Identifying the drones & UAVs in the video feed using object detection.

•Discovery : Logging the identities of the drones & UAVs flying in a particular air space at any instant of time, using exchange of unique identifiers.

•Geo-fencing : Discovering unlawful presence and raising alarms using the detection & discovery data.

•Monitoring : Looking out and reporting incidents based on event detection in visual data.

•Analysis : Analyzing route patterns and incidents.

•Drone Incident Reporting : Publish drone incident reports, preventive measures and remediation using a decentralized twitter application over the Ethereum blockchain network and Embark Tools.

We utilize the SAP UI5, Fiori platform, Arcana network, expert.ai nlp apis, IPFS/Filecoin via NFT.Storage, XMTP, Tableland to built the platform solution and Tron DAO for DAO tooling. We also utilized Ethereum blockchain for developing a decentralized rating and review system for drones used by infrastructure service providers. 

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

1d. XDC blockchain network: EV Charging Systems on XDC network for monitoring of charging in drones, Connected UAVs for efficiency and sustainability. We are extending and adapting our platform for connected drons for sustainability and efficiency. Please visit: https://github.com/seetadev/PolyOps/tree/main/EV-Charge-Monitoring-XDC-blockchain/EVCM-XDC-Drone-Monitor


2. Tableland: We are developing monitoring notes platform for Drone and UAV administrators using Tableland. Please visit the app link at https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices/remoteislandmonitoring/Valist-Distribution/Monitoring-Notes

3. XMTP: We are implementing XMTP Chat for Drone administrators in a particular region with CyberConnect functions. Please visit the implementation link: https://github.com/seetadev/PolyOps/tree/main/XMTP-chat-CyberConnect/XMTPChat-CyberConnect

4. Arcana network: We are utilizing Arcana network as a decentralized storage, privacy preserving platform for setting up the drone identification data and also geo location maps. We are also using it to develop guard rails on where the drones can fly in a region in order to prevent unauthorized flying or collison detection.


5. Polygon and Governance of Drones and UAVs using Aragon Plugins: A decentralized survey for drone ratings by users using a governance solution built with Aragon plugins at the core is done at key intervals and its onchain voting snapshots enable credibility of ratings. We can enable our smart contracts read the storage of any contract at a given block. This enables on-chain voting, airdrops on Ethereum and Polygon. Please visit https://github.com/seetadev/PolyOps/tree/main/Snapshots-DroneSurveyRatings


6. MultiChain: We are using MultiChain Feed Adapter for reading a feed and writing to MySQL powered Tableland blockchain database.
We are developing monitoring notes platform for Drone and UAV administrators using MYSQL powered Tableland. Please visit the app link at https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices/remoteislandmonitoring/Valist-Distribution/Monitoring-Notes

Please find the link to MultiChain Feed Adapter for writing to MySQL powered Tableland at https://github.com/seetadev/PolyOps/tree/main/multichain-feed-adapter-master

7. Tron DAO: We are using DAOtooling for coordination with a social focus around community collaboration for UAV incidents and alarms using Tron DAO.

8. Chainlink VRF: We utilized Chainlink VRF (Verifiable Random Function) to enable provably fair and verifiable random number generator (RNG) that further enables smart contracts to access random values without compromising security or usability for drone incident reporting. For each request, Chainlink VRF generates one or more random values and cryptographic proof of how those values were determined. The proof is published and verified on-chain before any consuming applications can use it. This process ensures that results cannot be tampered with or manipulated by any single entity including oracle operators, users, or smart contract developers. At this juncture, we are planning to use only subscription supported network for Chainlink VRF. Link: https://github.com/seetadev/PolyOps/tree/main/Chainlink-VRFs

Chainlink External Adapter returns 4 uint64 packed into a bytes32. This External Adapter is executed by a Job, which is triggered by an External Initiator. Finally, this Job sends a TX to a Smart Contract with the result of the External Adapter, unpacking and saving the 4 uint64. Link: https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices
