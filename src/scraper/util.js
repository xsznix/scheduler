export function parseCourseHeader(header) {
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

export function parseSection(cells) {
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

export function parseMeetingHour(hour) {
  const matches = hour.trim().match(/^(.*)-(.*)$/);
  if (!matches) {
    return {};
  } else {
    return {start: parseTime(matches[1]), end: parseTime(matches[2])};
  }
}

export function parseTime(time) {
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

export function parseMeetingDays(days) {
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
