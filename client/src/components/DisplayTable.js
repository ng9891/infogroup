import React, { Component } from 'react';
import './SideBar.css';

class App extends Component {

  processData(data) {
    // do some stuff
    return []
  }
  renderTable(data) {
    return (
      <div>
        The Final Product
      </div>
    )
  }
  render() {
    let tableData = this.processData(this.props.data)
    return (
      <div>
        {this.renderTable(tableData)}
      </div>
    );
  }
}

export default App;