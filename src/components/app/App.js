import React from 'react';
import './App.scss';
import Config from './../config/Config';
import Code from './../code/Code';
import World from './../world/World';
import Info from './../info/Info';
import Buttons from './../buttons/Buttons';

function App() {
  return (
    <div className="app">
      <div className="body">
        <div className="row0">
          <Config></Config>
          <World></World>
        </div>
        <div className="row1">
          <Code></Code>
          <Info></Info>
        </div>
        <div className="row2">
          <Buttons></Buttons>
        </div>
      </div>
    </div>
  );
}

export default App;