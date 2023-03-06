import { useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import "./guild-nft-list.css";

function GuildNftList() {
  const navigate = useNavigate();
  const artImage = [
    {
      imageName: "Blockchain & Real Estates",
      description:
        "Safeguarding The Records Of Homes, Lands, And Property For Displaced Peoples Using Decentralized Trust and security provided by Blockchain.",
      price: "1245",
      src: "https://d3lkc3n5th01x7.cloudfront.net/wp-content/uploads/2019/05/15233606/700-X-394.png",
    },
    {
      imageName: "Bitcoin Whitepaper",
      description:
        "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution.",
      price: "1245",
      src: "https://www.buyucoin.com/crypto-labs/wp-content/uploads/2021/10/celebrating-the-seminal-bitcoin-white-paper-satoshi-nakamoto-published-13-years-ago-today-6mXZNb.jpeg",
    }
  ];
  return (
    <div style={{ backgroundColor: "rgb(32,32,32)", width: "100%" }}>
      <div>
        <h3
          style={{
            fontSize: "40px",
            fontFamily: "serif",
            textAlign: "center",
            color: "white",
            marginTop: "3%",
          }}
        >
          Guild Data :  Research Papers
        </h3>
        <hr />

        <h2 style={{ margin: "0px 0px 30px 170px", color: "white" }}>
          Submit Data Proposal{" "}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", marginLeft: "170px" }}>
          <div className="guild-section">
            <div className="row">
              <div className="col">
                <Card.Img
                  src="https://static.fabrik.io/ryg/39267e07ebc38be6.gif?auto=compress&w=1280&h=1280&fit=max&s=6ea7966cc3cabeeaeb2307849b0512ff"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    margin: "30px 0px 0px 30px",
                  }}
                />
              </div>
              <div className="col">
                {" "}
                <Card.Title
                  style={{ margin: "10px 0px 0px 0px", color: "white" }}
                  onClick={() => {
                    navigate("/guilds-upload");
                  }}
                >
                  <br />
                  <strong>Propose Data</strong>
                </Card.Title>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ margin: "0px 0px 30px 170px", color: "white" }}>
        Guild Data
      </h2>

      <div
        className="row"
        style={{ display: "flex", justifyContent: "center" }}
      >
        {artImage.map((image) => {
          return (
            <div className="col" style={{ maxWidth: "560px" }}>
              <Card style={{ width: "" }}>
                <Card.Body>
                  <Card.Img
                    src={image.src}
                    style={{
                      width: "500px",
                      height: "170px",
                    }}
                  />
                  <Card.Title>
                    <br />
                    <strong>{image.imageName}</strong>
                  </Card.Title>
                  <p>{image.description}</p>
                </Card.Body>
                <Card.Footer>
                  <span>
                    <Button
                      style={{
                        width:"auto",
                        backgroundColor: "grey",
                        borderRadius:"4%",
                        margin: "0px 0px 0px 370px",
                      }}
                    >
                      🔐 Get Access
                    </Button>
                  </span>
                </Card.Footer>
              </Card>
              <br />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GuildNftList;
