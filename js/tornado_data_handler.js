const _ = require('underscore');
const moment = require('moment');

// This class formats raw tornado csv data from NOAA and transforms it
// to create this chart: http://www.spc.noaa.gov/wcm/monthlytorcharts/001.png
// Input: Parsed CSV array from `tornadoes_minified.csv`
// See `clean_csv.rb` for columns labels

class TornadoDataHandler {
  constructor(data) {
    this.data = this._cleanData(data);

    this.headerIndexes = {
      year: this.data.header.indexOf("yr"),
      day: this.data.header.indexOf("dy"),
      month: this.data.header.indexOf("mo"),
      f: this.data.header.indexOf("f"),
      time: this.data.header.indexOf('time'),
      state: this.data.header.indexOf('st')
    }
  }

  headers() {
    return this.data.headers || [];
  }

  groupByMonth(month) {
    const dataFilteredByMonth = this.data.rows.filter((row) => {
      return row[this.headerIndexes.month] === month;
    });

    return this._allYears().map((year) => {
      const countByDays = new Array(moment((year, month), "YYYY M").daysInMonth());
      countByDays.fill(0);
      const byMonthAndYear = _.filter(dataFilteredByMonth, (item) => {
        return item[this.headerIndexes.year] === year && item[this.headerIndexes.f] > 0;
      });

      _.each(byMonthAndYear, (item, i) => {
        const day = item[this.headerIndexes.day] - 1; // 0 indexed
        countByDays[day] = countByDays[day]+1 || 0
      })

      return { year: year, counts: countByDays }
    });
  }

  groupByHourInState(stateInput) {
    const rows = this.data.rows;
    const month = 9;
    const daysInMonth = moment(("1999", month), "YYYY M").daysInMonth();

    const dataFilteredByMonthAndState = this.data.rows.filter((row) => {
      const state = row[this.headerIndexes.state] || "";
      return row[this.headerIndexes.month] === month;
    });

    const filteredResults = _.map(_.range(daysInMonth), (day) => {
      const countsForDay = _.map(_.range(24), (hour) => {
        const matching = _.filter(dataFilteredByMonthAndState, (row) => {
          const time = row[this.headerIndexes.time] || "";
          const dayFromData = row[this.headerIndexes.day];

          return parseInt(time.slice(0,2)) === hour && day === dayFromData;
        });
        return matching.length;
      });

      return { day: day, counts: countsForDay}
    });

    return filteredResults
  }

  groupByMonthSummed(month) {
    const groupedByMonth = this.groupByMonth(month);
    const groupByMonthSummed = {};

    return _.map(groupedByMonth, function(item) {
      const sumOfPreviousDays = _.map(item.counts, function(row, i) {
        return _.reduce(item.counts.slice(0, i), function(memo, num) {
          return memo + num;
        }, 0)
      });

      return { year: item.year, counts: sumOfPreviousDays }
    });
  }

  _allYears() {
    return _.reject(_.unique(this.data.rows.map((row) => {
      return row[this.headerIndexes.year] }
    )), function(row) { return _.isNaN(row) })
  }

  _cleanData(data) {
    const rows = data.slice(1).map(function(data) {
      return [
        parseInt(data[0]),
        parseInt(data[1]),
        parseInt(data[2]),
        parseInt(data[3]),
        data[4],
        data[5],
        data[6],
        parseFloat(data[7]),
        parseFloat(data[8]),
        parseInt(data[9])
      ]
    })

    return {
      header: data[0],
      rows: rows
    };
  }
}

module.exports = TornadoDataHandler
