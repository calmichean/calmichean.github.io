"use strict";

const offset = 78;
const days_per_month = 29;
const months_per_year = 12;
const set = 59;
const new_years_day = 1;

// TODO: separate out gregorian calendar functions
// keep gregorian calendar concerns separate from our calendar - less confusion
// not sure days_this_year is accurate with leap years

const gregory = {

  days_in_months: function() {
    let day_counts = {};
    for (let i = 1; i <= 12; i++) {
      day_counts[i] = 31;
    }
    [9,4,6,11].forEach(i => day_counts[i] = 30);
    day_counts[2] = this.is_leapyear(new Date().getFullYear()) ? 29 : 28;

    return day_counts;
  },

  current_day: function() {
    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let dm = this.days_in_months();
    for (let i = 1; i < month; i++){
      day += dm[i];
    }
    return day;
  },

  current_year: function() {
    return new Date().getFullYear();
  },

  is_leapyear: function(year) {
    return (year % 4 == 0); // TODO: it's more complicated than this
  }
}

function coincident_gregorian_year() {
  return gregory.current_year() - (gregory.current_day() > offset ? 0 : 1);
}

function moon_days() {
  let moon_days = {}
  for(let i = 1; i < 7; i++) {
    let day_num = (set*i) + new_years_day;
    moon_days[day_num] = i;
    moon_days.final = day_num;
  }
  moon_days.get = function(item) {
    if (this[item])
      return this[item];
  };
  return moon_days;
}

function first_day_of_years_end() {
  return moon_days().final + 1;
}

function months() {
  let seed = new_years_day + 1;
  let six = months_per_year / 2;
  let m = [];
  for(let i = 0; i < six; i++) {
    m[i] = seed + (set * i);
    m[i+six] = seed + days_per_month + (set * i);
  }
  m.sort(function(a,b){
    return a-b;
  });
  let months = [];
  for (let i = 0; i < m.length; i++) {
    months[i] = {
      start: m[i],
      end: m[i] + days_per_month - new_years_day,
      number: i + 1
    };
  }
  return months;
}

function days_this_year() {
  let gg = gregory.days_in_months(); // is this right? should be of coincident_gregorian_year
  let total = 0;
  for (let i in gg) total += gg[i];
  return total;
}

function current_day() {
  let day = gregory.current_day() - offset;
  if (day < 1) {
    day += days_this_year();
  }
  return day;
}

function date_from_yday(year_day) {
  if (year_day < 1 || year_day > days_this_year()) {
    return 'error: day of year is not possible'
  }
  else if (year_day == 1) {
    return 'New Year\'s Day';
  }
  else if (moon_days().get(year_day)) {
    return 'Moon Day ' + moon_days().get(year_day);
  }
  else if (first_day_of_years_end() <= year_day && year_day <= days_this_year()) {
    let s = 'Year\'s End Day ' + (year_day - first_day_of_years_end() + 1);
    if (year_day == days_this_year()) {
      s += ' (New Year\'s Eve)';
    }
    return s;
  }
  else {
    let m = 0;
    let d = 0;
    for (let i = 0; i < months().length; i++) {
      let month = months()[i];
      if (month['start'] <= year_day && year_day <= month['end']) {
        m = month['number'];
        d = year_day - month['start'] + 1;
      }
    }
    return m.toString() + '/' + d.toString();
  }
}

function todays_date() {
  return date_from_yday(current_day());
}

document.getElementById("date_info").innerHTML = todays_date();
