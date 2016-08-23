import React, {Component} from 'react';
import './index.css';

export default class Header extends Component {
  render() {
    return (
      <header className="Header">
        <span className="title">My Schedule</span>
        <select className="session" ref="session">
          <option value="20169">Fall 2016</option>
        </select>
      </header>
    );
  }
}
