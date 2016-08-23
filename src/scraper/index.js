import {
  parseCourseHeader,
  parseSection,
  parseMeetingHour,
  parseTime,
  parseMeetingDays,
} from './util';

const e = encodeURIComponent;

export default class Scraper {
  constructor(session = '20169') {
    this.session = session;
  }

  setSession(session) {
    this.session = session;
  }

  loadSearchResults(query = '') {
    const self = this;
    const courses = [];
    let currentCourse;
    return loadResultPage(query);

    function loadResultPage(query) {
      return new Promise((resolve, reject) => {
        self.loadPage(`${self.resultsUrl()}${query}`, {redirect: 'follow', credentials: 'include'}).then(response => {
          const dom = (new DOMParser()).parseFromString(response, 'text/html');
          const rows = [].slice.call(dom.querySelectorAll('.rwd-table.results tr'));

          rows.forEach(row => {
            const cells = [].slice.call(row.querySelectorAll('td'));
            if (cells.length === 0) {
              // Empty or header row.
              return;
            } else if (cells.length === 1 && cells[0].classList.contains('course_header')) {
              // Course header row.
              const header = parseCourseHeader(cells[0].innerText.trim());
              if (currentCourse) {
                if (header.field === currentCourse.field &&
                    header.number === currentCourse.number &&
                    header.description === currentCourse.description) {
                  return;
                } else {
                  courses.push(currentCourse);
                }
              }
              currentCourse = parseCourseHeader(cells[0].innerText.trim());
            } else {
              // Unique section row.
              currentCourse.sections.push(parseSection(cells));
            }
          });

          const next = dom.querySelector('#next_nav_link');
          if (next) {
            loadResultPage(next.getAttribute('href')).then(resolve, reject);
          } else {
            if (currentCourse) {
              courses.push(currentCourse);
            }
            resolve(courses);
          }
        }, reject);
      });
    }
  }

  loadPage(url, options = {}) {
    return new Promise((resolve, reject) => {
      fetch(url, options).then(response => {
        if (response.url.indexOf('https://login.utexas.edu') !== -1) {
          console.error('not logged in');
        } else {
          response.text().then(resolve, reject);
        }
      }, reject);
    });
  }

  resultsUrl() {
    return `https://utdirect.utexas.edu/apps/registrar/course_schedule/${this.session}/results/`;
  }

  padFOS(field) {
    if (field.length === 2) {
      return `${field[0]} ${field[1]}`;
    } else {
      return field;
    }
  }
}
