import React, {Component} from 'react';
import './index.css';

export default class CourseListItem extends Component {
  render() {
    return (
      <div className="CourseListItem">
        <div className="CourseListItem-number">CS 439</div>
        <div className="CourseListItem-name">INTRO TO OPERATING SYSTEMS</div>
      </div>);
  }
}
