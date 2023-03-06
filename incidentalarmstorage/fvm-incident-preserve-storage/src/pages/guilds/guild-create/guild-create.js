import { useNavigate } from "react-router-dom";
import $ from "jquery";
import React, { useState } from "react";
import { Card, Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { ethers } from "ethers";
import { DATAGUILD_ABI, DATAGUILD_ADDRESS } from "../../../constants";
import "./guild-create.css";
import { AddAPhoto } from "@mui/icons-material";

function GuildsCreate() {
  const navigate = useNavigate();
  $(function () {
    var container = $(".container"),
      inputFile = $("#file"),
      img,
      btn;

    if (!container.find("#upload").length) {
      container
        .find(".input")
        .append(
          '<input type="button" value="' + '" id="upload" class="button-test">'
        );
      btn = $("#upload");
      img = $("#uploadImg");
    }
    if (btn !== undefined) {
      btn.on("click", function () {
        img.animate({ opacity: 0 }, 300);
        inputFile.click();
      });
    }

    inputFile.on("change", function (e) {
      container
        .find("label")
        .html(inputFile.val().replace(/C:\\fakepath\\/i, ""));

      var i = 0;
      for (i; i < e.originalEvent.srcElement.files.length; i++) {
        var file = e.originalEvent.srcElement.files[i],
          reader = new FileReader();

        // reader.onloadend = function () {
        //   img.attr("src", reader.result).animate({ opacity: 1 }, 700);
        // };
        reader.readAsDataURL(file);
        // img.removeClass("hidden");
      }
    });
  });

  const create = async () => {
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

      let tx = await contract.createDataSetDealProposal("0x000181E2039220206B86B273FF34FCE19D6B804EFF5A3F5747ADA4EAA22F1D49C01E52DDB7875B4B", 2048, {
        gasLimit: 21000, // BlockGasLimit / 10
      });

      let receipt = await tx.wait()
      console.log(receipt)
      navigate("/guilds-list")
  
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="create-section"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Form
        style={{
          padding: "5%",
          width: "650px",
          height: "auto",
        }}
      >
        <Card style={{ height: "auto" }}>
          <Card.Header>
            <Card.Img
              src="https://img.freepik.com/premium-vector/world-map-made-from-binary-data-code_601748-31124.jpg"
              width="100%"
              height="200px"
            ></Card.Img>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div style={{ textAlign: "center" }}>
                <p>
                  <label id="img-data" htmlFor="input">
                    Data Guild Details
                  </label>
                </p>
              </div>

              <label htmlFor="upload-photo">
                <input
                  style={{ display: "none" }}
                  id="upload-photo"
                  name="upload-photo"
                  type="file"
                />

                <Button color="secondary" variant="contained" component="span">
                  <AddAPhoto style={{marginLeft:"170%"}} />
                </Button>
              </label>
            </div>
            <Form.Group controlId="title">
              <Form.Control
                className="form-input-style"
                placeholder="Data Guild Name"
                required
              />
              <br />
            </Form.Group>
            <Form.Group controlId="title">
              <Form.Control
                className="form-input-style"
                placeholder="Data Guild Description..."
                required
                as="textarea"
                rows={8}
                style={{ height: "70px" }}
              />
              <br />
            </Form.Group>

            <div className="row">
              <div
                className="col"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <button
                  className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={create}
                  style={{
                    backgroundColor: "#000",
                    border: "none",
                    color: "white",
                    width: "auto",
                    height: "auto",
                    fontSize: "14px",
                    textAlign: "center",
                    padding: "10px",
                  }}
                >
                  Deploy Data Guild
                </button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </div>
  );
}

export default GuildsCreate;
