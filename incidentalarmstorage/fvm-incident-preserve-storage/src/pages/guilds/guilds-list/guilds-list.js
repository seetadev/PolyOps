import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import "./guilds-list.css";
import Divider from '@mui/material/Divider';

function GuildsList() {
  const navigate = useNavigate();
  const guildsList = [
    {
      imageName: "Research Papers",
      src: "https://i.pinimg.com/originals/7b/f8/a2/7bf8a2514d28fc0d9a360a7f5cc8c8ec.gif",
      info: {
        guildName: "Web3 Research Papers",
        guildDescription: "This guild is a collection of major Web3 related research papers",
      },
    },
    {
      imageName: "Cat Images",
      src: "https://media.tenor.com/ZhfMGWrmCTcAAAAC/cute-kitty-best-kitty.gif",
      info: {
        guildName: "Cat Images",
        guildDescription: "This guild is a collection of cat pictures which can be used to train ML models",
      },
    },
    {
      imageName: "NASA - Moon",
      src: "https://media1.giphy.com/media/aN9GqoR7OD3nq/giphy.gif",
      info: {
        guildName: "Nasa Moon Collection",
        guildDescription: "This guild is a official guild for NASA Moon snapshots",
      },
    },
    {
      imageName: "NASA - Solar System",
      src: "https://media.tenor.com/cDEoYRhFZggAAAAM/planetas-sistema-solar.gif",

      info: {
        guildName: "Nasa Solar System Collection",
        guildDescription: "This guild is a official guild for NASA Solar System snapshots",
      },
    },
    {
      imageName: "Ancient Greek Coins",
      src: "https://thumbs.gfycat.com/DeadObedientGangesdolphin-max-1mb.gif",
      info: {
        guildName: "Dummy Guild Name 5",
        guildDescription: "Dummy Guild Description 5",
      },
    },
  ];
  return (
    <div className="list-section">
      <div>
        <br/>
        <br/>
        <h2 className="label">Data Guild Hall 📦</h2>
        <p style={{ textAlign: "center", color: "#8d8d8d" }}>
          <em>
            
          </em>
        </p>
      </div>
      <br/>
      <br/>
      <br/>
      <h2 style={{ margin: "0px 0px 30px 200px", color: "white" }}>
        Create yore own guild{" "}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", marginLeft: "200px" }}>
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
              >
                <br />
                <strong>Create guilds</strong>
              </Card.Title>
            </div>
          </div>
        </div>
      </div>
      <h2 style={{ margin: "0px 0px 30px 200px", color: "white" }}>
        Guilds
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", marginLeft: "200px" }}>
        {guildsList.map((image, i) => {
          return (
            <div
              key={i}
              className="guild-section"
              onClick={() => {
                navigate("/guilds-info", {
                  state: {
                    data: image.info,
                  },
                });
              }}
            >
              <div className="row">
                <div className="col">
                  <Card.Img
                    src={image.src}
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
                  >
                    <br />
                    <h6>{image.imageName}</h6>
                  </Card.Title>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GuildsList;
