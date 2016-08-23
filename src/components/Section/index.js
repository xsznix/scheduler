import React, {Component} from 'react';
import SectionTime from '../SectionTime';
import './index.css';

export default class Section extends Component {
  render() {
    return (
      <div className="Section">
        <input type="checkbox" className="Section-checked" ref="checked" />
        <div className="Section-unique"><a href="#">56265</a></div>
        <div className="Section-times">
          <SectionTime />
          <SectionTime />
        </div>
        <div className="Section-availability">open</div>
      </div>);
  }
}
