"use strict";

const offset = 78;
const days_per_month = 29;
const months_per_year = 12;
const new_years_day = 1;
const first_day_of_years_end = 356;
const moon_days = {
  60: 1,
  119: 2,
  178: 3,
  237: 4,
  296: 5,
  355: 6
};

const months = [
  {"start":2, "end":30, "number":1, "name": "allium"},
  {"start":31, "end":59, "number":2, "name": "anethum"},
  {"start":61, "end":89, "number":3, "name": "angustifolia"},
  {"start":90, "end":118, "number":4, "name": "basilica"},
  {"start":120, "end":148, "number":5, "name": "capsica"},
  {"start":149, "end":177, "number":6, "name": "crispa"},
  {"start":179, "end":207, "number":7, "name": "curcuma"},
  {"start":208, "end":236, "number":8, "name": "cymina"},
  {"start":238, "end":266, "number":9, "name": "origanum"},
  {"start":267, "end":295, "number":10, "name": "planifolia"},
  {"start":297, "end":325, "number":11, "name": "rosmarinus"},
  {"start":326, "end":354, "number":12, "name": "zingiber"}
];

function gregorian_day_of_year(day, month, year) {
  let date = new Date(year, month-1, day);
  let dc = day_counts(year);
  for (let i = 1; i < month; i++) {
    day += dc[i];
  }
  return day;
}

function is_a_leap_year(year) {
  return (year % 4 == 0); // TODO: it's more complicated than this
}

function day_counts(year) {
  return {
    1: 31,
    2: is_a_leap_year(year) ? 29 : 28,
    3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
  };
}

const greg = {};
greg.current_year = new Date().getFullYear();
greg.is_leapyear = is_a_leap_year(greg.current_year);
greg.days_in_months = day_counts(greg.current_year);

let date = new Date();
greg.current_day = gregorian_day_of_year(date.getDate(), date.getMonth()+1, greg.current_year);


// this does something with leap years at some point
const coincident_gregorian_year = greg.current_year - (greg.current_day > offset ? 0 : 1);

const days_this_year = (function(){// not sure this is accurate with leap years
  let gg = greg.days_in_months; // is this right? should be of coincident_gregorian_year
  let total = 0;
  for (let i in gg) total += gg[i];
  return total;
})();

function days_in_year(year) {
  return 365 + (is_a_leap_year(year) ? 1 : 0);
}

function calm_day_from_greg_day(yday, year) {
  let d = yday - offset;
  if (d < 1) d += days_in_year(year);
  return d;
}

const calmichean_current_day = (function(){
  let day = greg.current_day - offset;
  if (day < 1) {
    day += days_this_year;
  }
  return day;
})();

function date_from_yday(year_day) {
  let m_name = "", m=null,d=null;
  if (year_day < 1 || year_day > days_this_year) {
    m_name = 'error: day of year is not possible'
  }
  else if (year_day == 1) {
    m_name = 'New Year\'s Day';
  }
  else if (moon_days[year_day]) {
    m_name = 'Moon Day ' + moon_days[year_day];
  }
  else if (first_day_of_years_end <= year_day && year_day <= days_this_year) {
    m_name = 'Year\'s End Day ' + (year_day - first_day_of_years_end + 1);
    if (year_day == days_this_year) {
      m_name += ' (New Year\'s Eve)';
    }
  }
  else {
    for (let i = 0; i < months.length; i++) {
      let month = months[i];
      if (month['start'] <= year_day && year_day <= month['end']) {
        m = month['number'];
        m_name = month['name'];
        d = year_day - month['start'] + 1;
      }
    }
  }
  return {"month":m, "day":d, "month_name":m_name};
}

function convert(day, month, year) {
  let gregday = gregorian_day_of_year(day, month, year);
  let calmday = calm_day_from_greg_day(gregday);
  let calmdate = date_from_yday(calmday);
  let str = format_for_html(calmdate).replace('<br>',' ');
  return str
}

function todays_date() {
  return date_from_yday(calmichean_current_day);
}

function format_for_html(date) {
  let html = date["month_name"];
  if (date["day"] != null && date["month"] != null) {
    html += '<br>' + date["month"].toString() + '/' + date["day"].toString();
  }
  return html;
}

document.getElementById("date_info").innerHTML = format_for_html(todays_date());

const calendar_in_order = (function() {
  let m = [];
  m.push('new year\'s day');

  let jj = 0;
  for (let i = 0; i < months.length; i++) {
    m.push(months[i]["name"]);
    if (i % 2 != 0) {
      jj = i - jj;
      m.push('moon day ' + jj); // i=jj: 1=1, 3=2, 5=3, 7=4, 9=5, 11=6
    }
  }

  m.push('end of year time');
  return m;
})();

const calendar_display = (function() {
  let s = "";
  for (let i = 0; i < calendar_in_order.length; i++) {
    if (calendar_in_order[i].includes("year")) {
      s += '<li class="buffer">';
    }
    else if (calendar_in_order[i].includes("moon day")) {
      s += '<li class="moon">';
    } else {
      s += '<li>';
    }
    s += calendar_in_order[i] + '</li>';
  }
  return s;
})();

document.getElementById("calendar-items").innerHTML = calendar_display;

function convert_on_page() {
  let day = document.getElementById("formday").value;
  let month = document.getElementById("formmonth").value;
  let year = document.getElementById("formyear").value;
  if (year == "") year = greg.current_year;

  let strOutput = month+"/"+day+"/"+year + " would be<br/>";
  strOutput += convert(parseInt(day), parseInt(month), parseInt(year));
  document.getElementById("answer").innerHTML = strOutput;

  document.getElementById("formday").value = "";
  document.getElementById("formmonth").value = "";
  document.getElementById("formyear").value = "";
}

let formClick = function(event) {
  if (event.keyCode === 13) {
    document.getElementById("convertButton").click();
  }
}
let formyear = document.getElementById("formyear");
let formday = document.getElementById("formday");
let formmonth = document.getElementById("formmonth");
formyear.addEventListener("keyup", formClick);
formday.addEventListener("keyup", formClick);
formmonth.addEventListener("keyup", formClick);
