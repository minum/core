[![Build Status](https://travis-ci.org/metrics-io/core.png?branch=master)](https://travis-ci.org/metrics-io/core)
metrics-io
=============

When its comes to metrics, aggregations plays a huge role. If that fails, then there is no use of collecting metrics. Here is the how `metrics-io` do it correctly.

* There are sources who generate metrics
* metrics will be collected with the awareness of the source
* When it comes aggregations, metrics will be aggregated in 2 steps
* It will first aggregate values in each source, then result will be aggregated 
* function which used to aggregate metrics can be specified in runtime
* result will be grouped into time resolutions

## Tracking Metrics

~~~js
var MONGODB_URL = "mongodb://localhost/test";
var metrics = require('metrics-io')(MONGODB_URL);

metrics.track('no-of-users', 344, 'my-source', function(err) {

});
~~~

## Aggregate Metrics

#### API

 	@param {String} name - name of the metric
        @param {Constant} resolution - resolution type
            possible values: "day", "hour", "minute", "five_secs"
        @param {String} valueAggregator - aggregation function to be used for aggregating metric of the each source
            possible values: "sum", "avg", "min", "max"
        @param {String} sourceAggregator - aggregation function to be used for the aggregating sources(value from metricsAggregation)
            possible values: "sum", "avg", "min", "max"
        @param {Object} query - mongodb query for filtering out metrics
            only supports date and source only
        @param {Function} callback - callback function
            callback(err, results)
    
    Metrics.aggregate = function(name, resolution, valueAggregator, sourceAggregator, query, callback){}

#### Example

~~~js
	
var MONGODB_URL = "mongodb://localhost/test";
var metrics = require('metrics-io')(MONGODB_URL);

metrics.aggregate('no-of-users', 'minute', 'avg', 'sum', {date: { $gte: 1361030882576 }}, function(err, result) {

});
~~~
