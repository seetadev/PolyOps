import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "./home.css";

function Home() {
  const navigate = useNavigate();
  return (
    <>
      <div className="home">
        <p className="description">
          <h1 className="title">Data Guilds</h1>
          <br />
          Build or participate in DataGuilds whose mission revolves around the preservation, curation, augmentation, 
          and promotion of datasets considered valuable by their stakeholders.
          <br /> 
          <br /> 
        </p>
        <span>
          <Button
            style={{ margin: "30px 0px 0px 50px" }}
            onClick={() => {
              navigate("/guilds-create");
            }}
          >
            Create Guilds
          </Button>
          &nbsp;
          <Button
            style={{ margin: "30px 0px 0px 50px" }}
            onClick={() => {
              navigate("/guilds-list");
            }}
          >
            Explore Guilds
          </Button>
        </span>
      </div>
    </>
  );
}

export default Home;
