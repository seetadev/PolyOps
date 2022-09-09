import React from "react";
import Popup from "reactjs-popup";

const Form2 = props => (
  <div>
	 <Popup
    trigger={<button className="button"> Open Camera </button>}
    modal
    contentStyle={{
  width: '60%',
  height:'70%'}}
  >
    {close => (
     <div>
     <a className="close" onClick={close}>
          &times;
        </a>
        <div className="header"> Login Page </div>
      <div className="content">
         <form onSubmit={this.handleSubmit}>
        <label>
          User Name:
          <input type="text"  onChange={this.handleChange} />
        </label>
        <label>
          Password:
          <input type="text"  onChange={this.handleChange} />
        </label>
      </form>
        </div>
         <div className="actions">       
          <button
            className="button"
            onClick={() => {
              console.log("modal closed ");
              close();
            }}
          >
            Login
          </button>
        </div>
       </div>
    )}
  </Popup>
  </div>
);

export default Form2;