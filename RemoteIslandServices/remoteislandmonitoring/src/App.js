import React from "react";

import Titles from "./components/Titles";
import Form from "./components/Form";
import Form2 from "./components/Form2";
import Weather from "./components/Weather";
import Popup from "reactjs-popup";
//import onvifCMD from "node-onvif";

const API_KEY = "39c9db1964bccda6d792b8414dfc3d85";

const onvif = require('node-onvif');

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { modalActive: false }
  }

  contentStyle = {
  maxWidth: "600px",
  width: "90%"
}

  state = {
    temperature: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    error: undefined,
    userName:undefined
  }
  getWeather = async (e) => {
    e.preventDefault();

    // const res = await fetch('http://193.159.244.134:80',
    // {
    //         method: 'POST',
    //         headers: {
    //           'Accept': 'application/json',
    //           'Content-Type': 'application/json',
    //           "Connection": "keep-alive"
    //         },
    //         body: JSON.stringify({'username':'service','password':'Xbks8tr8vT'})
    //       }).then((response) => {
    //         //response.json().then((data) => {
    //            console.log(response)
    //       //});
    //       }).catch((error) => {
    //         console.log('Error', error); 
    //       })

    //const deviceInfo = await res.json();

    const city = e.target.elements.city.value;
    const country = e.target.elements.country.value;
    const api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`);
    const data = await api_call.json();
    if (city && country) {
      this.setState({
        temperature: data.main.temp,
        city: data.name,
        country: data.sys.country,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        error: ""
      });
    } else {
      this.setState({
        temperature: undefined,
        city: undefined,
        country: undefined,
        humidity: undefined,
        description: undefined,
        error: "Please enter the values."
      });
    }
  }
  getCamera() {
    //f.preventDefault();
      onvif.startProbe().then((device_info_list) => {
  console.log(device_info_list.length + ' devices were found.');
  // Show the device name and the URL of the end point.
  device_info_list.forEach((info) => {
    console.log('- ' + info.urn);
    console.log('  - ' + info.name);
    console.log('  - ' + info.xaddrs[0]);
  });
}).catch((error) => {
  console.error(error);
});
  }
   getCameraWithIP= async (e) => {
    e.preventDefault();

    const res = await fetch('http://193.159.244.134:80',
    {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              "Connection": "keep-alive"
            },
            body: JSON.stringify({'username':'service','password':'Xbks8tr8vT'})
          }).then((response) => {
            //response.json().then((data) => {
               console.log(response)
          //});
          }).catch((error) => {
            console.log('Error', error); 
          })
  }
  openModal = () => {
    this.setState({ modalActive: true })
  }

  closeModal = () => {
    this.setState({ modalActive: false })
  }


  render() {
    return (
      <div>
        <div className="wrapper">
          <div className="main">
            <div className="container">
              <div className="row">
                <div className="col-xs-5 title-container">
                  <Titles />
                </div>
                <div className="col-xs-7 form-container">
                <div>
                <button className="button" onClick={this.getCamera}>Goto Camera ( ONVIF )</button>
                
                <button className="button" onClick={this.getCameraWithIP}>Goto Camera ( CORS )</button>
                </div>
                <Form getWeather={this.getWeather} />
                  <Weather 
                    temperature={this.state.temperature} 
                    humidity={this.state.humidity}
                    city={this.state.city}
                    country={this.state.country}
                    description={this.state.description}
                    error={this.state.error}
                  />
                  </div>
                  
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default App;