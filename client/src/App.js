import React, { Component } from 'react';
import LeafletMap from './components/LeafletMap'
import SideBar from './components/SideBar'
import './App.css';

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      businessPoints:[],
      zipcode: 12203
    }
    this.updateZip = this.updateZip.bind(this)
  }

  updateZip (zipcode) {
    this.loadEstablishments(zipcode)
  } 

  loadEstablishments(zip) {
    fetch(`http://localhost:3001/api/byzip/${zip}`)
       .then(response => response.json())
       .then(data => {
        console.log('get some data',data)
          this.setState({businessPoints: data, zipcode: zip})
      })
  }

  componentDidMount () {
    this.loadEstablishments(this.state.zipcode)
  }

  render() {
    
    return (
      <div className="App" style={{width:'100vw', height: '100vh', overflow: 'hidden'}}>
        <LeafletMap data={this.state.businessPoints} zipcode={this.state.zipcode}/>
        <SideBar zipcode={this.state.zipcode} updateZip={this.updateZip} data={this.state.businessPoints} />
      </div>
    );
  }
}

export default App;
