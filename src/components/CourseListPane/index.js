import React, {Component} from 'react';
import CourseListItem from '../CourseListItem';
import './index.css';

export default class CourseListPane extends Component {
  render() {
    return (
      <nav className="CourseListPane">
        <section>
          <h3>Scheduled</h3>
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
        </section>
        <section>
          <h3>Watchlist</h3>
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
          <CourseListItem />
        </section>
      </nav>);
  }
}
