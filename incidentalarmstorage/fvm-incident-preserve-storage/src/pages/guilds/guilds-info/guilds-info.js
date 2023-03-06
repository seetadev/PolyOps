import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import { ethers } from "ethers";
import "./guilds-info.css";
import { MEMBERSHIP_NFT_ADDRESS, MEMBERSHIP_NFT_ABI } from "../../../constants.js";

function GuildsInfo() {
  const navigate = useNavigate();
  const location = useLocation();

  const joinGuild = async () => {
    try {
      const message =
        "Welcome to Data Guilds !";
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const address = await signer.getAddress();


      const contract = new ethers.Contract(
        MEMBERSHIP_NFT_ADDRESS,
        MEMBERSHIP_NFT_ABI,
        signer
      );
      console.log(contract);

      let tx = await contract.mint(address, {
        //gasLimit: 21000, // BlockGasLimit / 10
      });

      let receipt = await tx.wait()
      console.log(receipt)
  

      navigate("/guilds-nft-list");
    } catch (error) {
      console.log(error);
    }
  };

  const admin = async () => {
    try {
      const message =
        "Admin Access Granted";
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const address = await signer.getAddress();

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="">
      <div className="info-section">
        <div className="">
          <img
            className="cover-img"
            src="https://i.pinimg.com/originals/7b/f8/a2/7bf8a2514d28fc0d9a360a7f5cc8c8ec.gif"
            alt=""
          />
        </div>
        <div className="">
          <div style={{ margin: "200px 0px 0px 0px" }}>
            <h1 className="guild-title">
              {location.state !== null
                ? location.state.data.guildName
                : "Dummy Text Name"}
            </h1>
            <p className="guild-description">
              {location.state !== null
                ? location.state.data.guildDescription
                : "Dummy Description"}{" "}
              <br />
            </p>
            <Button
              style={{
                border: "none",
                borderRadius: "10px",
                margin: "30px 200px 0px 10px",

              }}
              onClick={joinGuild}
            >
              Join
            </Button>
            <Button
              style={{
                border: "none",
                borderRadius: "10px",
                margin: "30px 0px 0px 115px",
              }}
              onClick={admin}
            >
              Admin Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuildsInfo;
