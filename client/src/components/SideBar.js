import React, { Component } from 'react';
import DisplayTable from './DisplayTable'
import './SideBar.css';


class App extends Component {
  constructor (props) {
    super(props)
    this.updateZip = this.updateZip.bind(this)
  }

  
  updateZip() {
    console.log(document.getElementById('zipInput').value)
    this.props.updateZip(document.getElementById('zipInput').value)
  } 

  render() {
    return (
      <div className="sideBar">
        Zipcode:
        <input id='zipInput' name='zipcode'/>
        <button onClick={this.updateZip}>Load Data</button>

        <DisplayTable data={this.props.data} />
      </div>
    );
  }
}

export default App;