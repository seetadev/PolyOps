# PolyOps
Enable effective management and communication setup for Drones utilized in Construction, Logistics, Operations, Remote Water Monitoring, Sewage Management, Quality Assurance and Recyclability of Water in rivers.


Platform Features:

•Detection : Identifying the drones & UAVs in the video feed using object detection.

•Discovery : Logging the identities of the drones & UAVs flying in a particular air space at any instant of time, using exchange of unique identifiers.

•Geo-fencing : Discovering unlawful presence and raising alarms using the detection & discovery data.

•Monitoring : Looking out and reporting incidents based on event detection in visual data.

•Analysis : Analyzing route patterns and incidents.

•Drone Incident Reporting : Publish drone incident reports, preventive measures and remediation using a decentralized twitter application over the Ethereum blockchain network and Embark Tools.

We utilize the SAP UI5, Fiori platform, Coinex Smart Chain, Polygon, IPFS/Filecoin via NFT.Storage, XMTP, Tableland to built the platform solution and Valist for distribution. We also utilized Ethereum blockchain for developing a decentralized rating and review system for drones used by infrastructure service providers.

Our platform solution offers an Artificial Intelligence-based object detection system that utilizes blockchain solutions for sorting information obtained from a variety of drone cameras deployed at monitoring spots.

Our platform will provide the requisites features to share security conditions and remotely monitor the management policies in a place using used and broken phones and tablets, alarm clocks, internet connection, sync service, integration with IP cameras, raise safety alarms. The cost of deployment and added technology is limited which could help the businesses living in a variety of geographical regions. We also utilized google spreadsheets and its apis, google map APIs and telegram bot for developing monitoring and management application.

We have developed our solution based on a variety of blockchain protocols and solutions.

1a. Moralis Transaction Dashboard: We are developing an aggregated dashboard for all transfers and transactions using Moralis boilerplate as a reference.
Please visit the link at https://github.com/seetadev/PolyOps/tree/main/Moralis-Tx-Dashboard/Tx-Dashboard

1b. NFT.Storage for Filecoin: We are using NFT.Storage for storing a variety of offchain data like incident snapshots, alarm metadata and object types at the time of incident. Please find the video at https://drive.google.com/drive/folders/107GHYZVHIr867kV4abkQaWbeCrSrMwVN (screencapturewithoutsound.mov file). We are storing Alarm metadata using NFT.Storage. Also, Saving/deleting alarm metadata and image to/from IPFS using NFT.Storage. We are also storing the hash returned from IPFS to Ethereum test network using NFT.Storage. Further we are using NFT.Storage for: Video analytics configuration using NFT.Storage; Camera Management: Add/edit/delete cameras with integration with Livepeer, NFT.Storage; Live streaming with Object Detection Video Analytics using Livepeer for streaming, and NFT.Storage for snapshots.

1c. Vital Metadata on Filecoin Network: We are storing vital geofencing and additional monitoring data on Filecoin network. Please visit https://github.com/seetadev/PolyOps/tree/main/incidentalarmstorage/metadata-storage-on-filecoin 

Please visit: https://github.com/seetadev/PolyOps/tree/main/incidentalarmstorage

1d. Coinex Smart chain: https://github.com/seetadev/PolyOps/tree/main/CoinexCSC-Audit

2. Tableland: We are developing monitoring notes platform for Drone and UAV administrators using Tableland. Please visit the app link at https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices/remoteislandmonitoring/Valist-Distribution/Monitoring-Notes

3. XMTP: We are implementing XMTP Chat for Drone administrators in a particular region with CyberConnect functions. Please visit the implementation link: https://github.com/seetadev/PolyOps/tree/main/XMTP-chat-CyberConnect/XMTPChat-CyberConnect

4. Valist: We are using Valist to distribute 2 apps:

a. Monitoring Notes built using React and Tableland: https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices/remoteislandmonitoring/Valist-Distribution/Monitoring-Notes
 
b. Remote Island Weather Dashboard app built with React: https://github.com/seetadev/PolyOps/tree/main/RemoteIslandServices/remoteislandmonitoring


Other Key Technologies Used:

Swarm: For maintaining a knowledge management system of drones in a region, we are using Swarm. Our knowledge management is based upon Ethereum Smart Contracts and Swarm. Documents are added to the distributed file storage solution Swarm and the hashes of those documents will be added with a description to a smart contract on the Ethereum network. Please visit: https://github.com/seetadev/PolyOps/tree/main/SwarmDocumentManager/swarmdocumentmanager

AnonDrop (Nym): We are storing the documents to IPFS using AnonDrop having the following features:
Files are encrypted locally and uploaded to server app using Nym mixnet.
Server app (service-provider) store the files in IPFS using Textile buckets.
Files can be retrieved/deleted later using the file hash. Knowledge of hash proves the ownership of files.
Neither service-provider or IPFS storage providers can see the contents or name of the stored files.
Connect multiple devices running NymDrive and keep them in sync.
Please visit https://github.com/seetadev/PolyOps/tree/main/SwarmDocumentManager/nymdrive-uploadcontenttoipfs
We are planning to develop a P2P service, an equivalent of Airdrop to enable mesh network sharing.

(Aragon) Governance of Drones and UAVs using Aragon Plugins: A decentralized survey for drone ratings by users using a governance solution built with Aragon plugins at the core is done at key intervals and its onchain voting snapshots enable credibility of ratings. We can enable our smart contracts read the storage of any contract at a given block. This enables on-chain voting, airdrops on Ethereum and Polygon. Please visit https://github.com/seetadev/PolyOps/tree/main/Snapshots-DroneSurveyRatings

Near Protocol for community ownership of drones: We allow government agencies, civic bodies and community citizens to be owner of the drones using Near Protocol. Please visit https://github.com/seetadev/PolyOps/tree/main/Snapshots-DroneSurveyRatings/communitydroneownersusingnear
and  https://github.com/seetadev/PolyOps/tree/main/Snapshots-DroneSurveyRatings/communitydroneownersusingnear/near%20protocol%20reference

Aave governance for extensibility of drone governance on Optimism and Arbitrum: We are using Aave cross chain bridges to extend drone governance to other blockchain networks like Optimism and Arbitrum. Please visit https://github.com/seetadev/PolyOps/tree/main/Snapshots-DroneSurveyRatings/aave-governance-crosschain-bridges

Unstoppable Domains: A simple URL to redirect users to an NFT domain simply and quickly. We can also use this domain as a search engine to easily access NFT domains via your browser search. Please visit: https://github.com/seetadev/PolyOps/tree/main/Snapshots-DroneSurveyRatings/CommunitydonorsusingUnstoppableDomains
