import React, {Component} from 'react';
import './index.css';

export default class SectionTime extends Component {
  render() {
    return (
      <div className="SectionTime">
        <div className="SectionTime-days">MW</div>
        <div className="SectionTime-hours">9:00–11:00</div>
      </div>
      );
  }
}
