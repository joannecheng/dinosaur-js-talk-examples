const _ = require('underscore');
const moment = require('moment');

// This class formats raw tornado csv data from NOAA and transforms it
// to create this chart: http://www.spc.noaa.gov/wcm/monthlytorcharts/001.png
// Input: Parsed CSV array from `tornadoes_minified.csv`
// See `clean_csv.rb` for columns labels

class TornadoDataHandler {
  constructor(data) {
    this.data = this._cleanData(data);
  }

  headers() {
    return this.data.headers || [];
  }

  groupByMonth(month) {
    const monthIndex = this.data.header.indexOf("mo");
    const dayIndex = this.data.header.indexOf("dy");
    const yearIndex = this.data.header.indexOf("yr");

    const dataFilteredByMonth = this.data.rows.filter(function(row) {
      return row[monthIndex] === month;
    });

    return this._allYears().map(function(year) {
      const countByDays = new Array(moment((year, month), "YYYY M").daysInMonth());
      countByDays.fill(0);
      const byMonthAndYear = _.filter(dataFilteredByMonth, function(item) {
        return item[yearIndex] === year;
      });

      _.each(byMonthAndYear, function(item, i) { 
        const day = item[dayIndex] - 1; // 0 indexed
        countByDays[day] = countByDays[day]+1 || 0
      })

      return { year: year, countByDays: countByDays }
    });
  }

  groupByMonthSummed(month) {
    const groupedByMonth = this.groupByMonth(month);
    const groupByMonthSummed = {};

    return _.map(groupedByMonth, function(item) {
      const sumOfPreviousDays = _.map(item.countByDays, function(row, i) {
        return _.reduce(item.countByDays.slice(0, i), function(memo, num) {
          return memo + num;
        }, 0)
      });

      return { year: item.year, countByDays: sumOfPreviousDays }
    });
  }

  _allYears() {
    const yearIndex = this.data.header.indexOf("yr");
    return _.reject(_.unique(this.data.rows.map(function(row) {
      return row[yearIndex] }
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
