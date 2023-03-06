import { Button, Card } from "react-bootstrap";
import "./dao-dashboard.css";
import { ethers } from "ethers";
import { DATAGUILD_ABI, DATAGUILD_ADDRESS } from "../../constants";

function Dashboard() {
  const dashboardData = [
    {
      id: 1,
      uri: "bafy2bzacebqfpeylmrl4h3pq4ofbdj2bfbw2i45fuy6qm4wxcyebpsxhrpqhu",
      status: "Pending",
    },
    {
      id: 2,
      uri: "bafy2bafbdj2bfbw2i45fuy6qm4wxcyebpsxhrpqhuacebqfpeylmrl4h3pq4o",
      status: "Accepted",
    }
  ];



  const accept = async () => {
    try {
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();


      const contract = new ethers.Contract(
        DATAGUILD_ADDRESS,
        DATAGUILD_ABI,
        signer
      );
      console.log(contract);

      let tx = await contract.approveOrRejectDataSet("0x000181E2039220206B86B273FF34FCE19D6B804EFF5A3F5747ADA4EAA22F1D49C01E52DDB7875B4B", 1, 0, {
        gasLimit: 210000, // BlockGasLimit / 10
      });

      let receipt = await tx.wait()
      console.log(receipt)
  
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="dashboard-data">
        <table>
          <thead>
            <tr>
              <th>Data ID</th>
              <th>Data URI</th>
              <th>PROPOSAL STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.map((data, i) => {
              return (
                <>
                  <tr>
                    <td key={i}>{data.id}</td>
                    <td>{data.uri}</td>
                    <td>{data.status}</td>
                    <td>
                      {data.status === "Accepted" && (
                        <img
                          src="https://t3.ftcdn.net/jpg/01/57/86/44/360_F_157864480_TFm1nQsUI1o8VLKg6SK6yV9P6tsK4TXN.jpg"
                          width="50"
                          onClick={accept}
                        />
                      )}
                      {data.status === "Rejected" && (
                        <img
                          src="https://img.freepik.com/premium-vector/red-cross-mark-icon-negative-choice-symbol-sign-app-button_744955-339.jpg?w=360"
                          width="35"
                          onClick={accept}
                        />
                      )}
                      {data.status === "Pending" && (
                        <>
                          <img
                            src="https://t3.ftcdn.net/jpg/01/57/86/44/360_F_157864480_TFm1nQsUI1o8VLKg6SK6yV9P6tsK4TXN.jpg"
                            width="50"
                            onClick={accept}
                          />
                          <img
                            src="https://img.freepik.com/premium-vector/red-cross-mark-icon-negative-choice-symbol-sign-app-button_744955-339.jpg?w=360"
                            width="35"
                            onClick={accept}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Dashboard;
