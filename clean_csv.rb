require "csv"

tornadoes = CSV.read("all_tornadoes.csv", headers: true)

CSV.open("tornadoes_minified.csv", "w") do |csv|
  columns = [
    :tornado_number,
    :yr,
    :mo,
    :dy,
    :time,
    :tz,
    :st,
    :slat,
    :slon,
    :f
  ]
  csv << columns
  tornadoes.each do |row|
    csv << columns.map { |column| row[column.to_s] }
  end
end
