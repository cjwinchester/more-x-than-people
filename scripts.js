var input = document.getElementById('livestock-picker');
var loading = document.getElementById('loading');
var reset_button = document.getElementById('reset');
var results = document.getElementById('results');
var count = document.getElementById('count');
var opts = Array.prototype.slice.call(document.getElementsByTagName('option')).map(function(x) { return x.value});

// boilerplate county map from https://bl.ocks.org/mbostock/4122298
var svg = d3.select("svg")
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("viewBox", "0 0 960 600");

var path = d3.geoPath();

d3.json("us-counties.json", function(error, us) {
  if (error) throw error;

  var counties = svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path);

  var county_borders = svg.append("path")
      .attr("class", "county-borders")
      .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })));

  var states = svg.append("g")
      .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path);

  input.addEventListener('change', function() {
    if (!this.value) { reset(); return; }
    if (opts.indexOf(this.value) > -1) {
      updateMap(this.value);
    } else {
      console.log('not there')
    }
  });

  loading.style.display = 'none';
  
  function updateMap(animal) {
    var table_data = [];

    loading.style.display = 'block';
    counties.attr('fill', function(d) {
      var count = d.properties[animal];
      var pop = d.properties['pop'];
        if (!isNaN(count)) {
          if (parseInt(count) > parseInt(pop)) {
            var data_out = [
              d.properties['county'],
              d.properties['state'],
              pop,
              count
            ]
            table_data.push(data_out)
            return '#7d5415';
          }
        }
      });
    var sorted_array = table_data.sort(function (a, b) {
      var state1 = a[1].toLowerCase();
      var state2 = b[1].toLowerCase();
      var county1 = a[0].toLowerCase();
      var county2 = b[0].toLowerCase();

      if (state1 === state2) {
        return (county1 < county2) ? -1 : (county1 > county2) ? 1 : 0;
      } else {
        return (state1 < state2) ? -1 : 1;
      }
    });
    
    populateTable(sorted_array, animal);
    count.innerHTML = 'Found at least ' + sorted_array.length;

    loading.style.display = 'none';    
  }

  var comma_format = d3.format(',');

  function populateTable(array, animal) {
    var table = '<table><thead><tr><th>county</th><th>state</th><th style="text-align:right;">people</th><th style="text-align:right;">' + animal + '</th></tr></thead><tbody>';
    for (var i=0; i<array.length; i++) {
      table += [
        '<tr>',
        '<td>',
        array[i][0],
        '</td>',
        '<td>',
        array[i][1],
        '</td>',
        '<td style="text-align:right;">',
        comma_format(array[i][2]),
        '</td>',
        '<td style="text-align:right;">',
        comma_format(array[i][3]),
        '</td>',
        '</tr>'
        ].join('');
    }
    table += '</tbody></table>';
    results.innerHTML = table;
  }

  function reset() {
    counties.attr('fill', '#FEFCF9');
    count.innerHTML = 'Find';
    results.innerHTML = '';
    input.value = '';
  }

  reset_button.addEventListener('click', reset);

});