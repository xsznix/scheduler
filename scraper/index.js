'use strict';

const e = encodeURIComponent;

class Scraper {
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

    function parseCourseHeader(header) {
      const matches = header.match(/^([A-Z](?: [A-Z]|[A-Z]{2})?)  ([0-9]{3}[A-Z]*) (.*$)/);
      if (matches) {
        return {
          field: matches[1].replace(/\s/g, ''),
          number: matches[2],
          description: matches[3],
          sections: [],
        }
      }
    }

    function parseSection(cells) {
      const output = {
        meetings: [],
        flags: [],
        cores: [],
      };
      let days, hour, room;
      cells.forEach(cell => {
        switch (cell.getAttribute('data-th')) {
          case 'Unique':
          output.unique = cell.innerText.trim();
          break;

          case 'Days':
          days = cell.innerText.trim().split('\n');
          break;

          case 'Hour':
          hour = cell.innerText.trim().split('\n');
          break;

          case 'Room':
          room = cell.innerText.trim().split('\n');
          break;

          case 'Instructor':
          output.instructor = cell.innerText.trim();
          break;

          case 'Status':
          output.status = cell.innerText.trim();
          break;

          case 'Flags':
          [].slice.call(cell.querySelectorAll('ul.flag > li')).forEach(flag => {
            if (flag.className.length) {
              output.flags.push({
                abbreviation: flag.className,
                title: flag.innerText.trim(),
              });
            }
          });
          break;

          case 'Core':
          [].slice.call(cell.querySelectorAll('ul.core > li')).forEach(core => {
            if (core.className.length) {
              output.cores.push({
                abbreviation: core.className,
                title: core.innerText.trim(),
              });
            }
          });
          break;

          default:
          console.warn(`Unrecognized column while parsing: ${cell.getAttribute('data-th')}`);
        }
      });

      for (let i in days) {
        const {start, end} = parseMeetingHour(hour[i]);
        output.meetings.push({
          days: parseMeetingDays(days[i]),
          startTime: start,
          endTime: end,
          room: room[i],
        });
      }

      return output;
    }

    function parseMeetingHour(hour) {
      const matches = hour.trim().match(/^(.*)-(.*)$/);
      if (!matches) {
        return {};
      } else {
        return {start: parseTime(matches[1]), end: parseTime(matches[2])};
      }
    }

    function parseTime(time) {
      const matches = time.match(/^([0-9]{1,2}):([0-9]{2}) ([ap])\.m\.$/);
      if (!matches) {
        return {unknown: true};
      } else {
        return {
          hours: +matches[1] + (matches[3] === 'p' && +matches[1] !== 12 ? 12 : 0),
          minutes: +matches[2],
        };
      }
    }

    function parseMeetingDays(days) {
      const output = [];
      const matches = days.replace(/\s/g, '').match(/^(M?)(T?)(W?)((?:TH)?)(F?)(S?)$/);
      if (!matches) {
        return output;
      }

      const weekdays = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (let i = 1; i < 7; i++) {
        if (matches[i].length) {
          output.push(weekdays[i]);
        }
      }

      return output;
    }
  }

  loadPage(url, options = {}) {
    return _load(true);

    function _load(retry) {
      return new Promise((resolve, reject) => {
        fetch(url, options).then(response => {
          if (response.url.indexOf('https://login.utexas.edu') !== -1) {
            if (retry) {
              _load(false);
            } else {
              console.error('not logged in');
            }
          } else {
            response.text().then(resolve, reject);
          }
        }, reject);
      });
    }
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