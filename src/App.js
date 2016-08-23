import React, {Component} from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <main>
          <Sidebar />
          <main className="App-main" />
        </main>
      </div>
    );
  }
}
