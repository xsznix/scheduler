import React, {Component} from 'react';
import CourseListPane from '../CourseListPane';
import CourseDetailsPane from '../CourseDetailsPane';
import './index.css';

export default class Sidebar extends Component {
  render() {
    return (
      <div className="Sidebar">
        <CourseListPane />
        <CourseDetailsPane />
      </div>);
  }
}
