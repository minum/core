minum [![Build Status](https://travis-ci.org/minum/core.png)](https://travis-ci.org/minum/core)
=============

When its comes to metrics, aggregations plays a huge role. If that fails, then there is no use of collecting metrics. Here is the how `minum` do it correctly.

* There are sources who generate metrics
* metrics will be collected with the awareness of the source
* When it comes aggregations, metrics will be aggregated in 2 steps
* It will first aggregate values in each source, then result will be aggregated 
* function which used to aggregate metrics can be specified in runtime
* result will be grouped into time resolutions

## Tracking Metrics

~~~js
var MONGODB_URL = "mongodb://localhost/test";
var minum = require('minum')(MONGODB_URL);

minum.track('no-of-users', 344, 'my-source', function(err) {

});
~~~

## Aggregate Metrics

#### API

##### aggregate

Aggregate both values and sources

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

##### aggregateOnlyValues

Only aggregate values, source will not be aggregated and return values aggregations 

        @param {String} name - name of the metric
        @param {Constant} resolution - resolution type
            possible values: "DAY", "HOUR", "MINUTE", "FIVE_SECS"
        @param {String} valueAggregator - aggregation function to be used for aggregating metric of the each source
            possible values: "sum", "avg", "min", "max"
        @param {Array} sourceFilter - list of sources need to be return in the result. if empty all the sources will be retured
        @param {Object} query - mongodb query for filtering out metrics
            only supports date and source only
        @param {Function} callback - callback function
            callback(err, results)
    
    Metrics.aggregate = function(name, resolution, valueAggregator, sourceAggregator, query, callback){}

##### identifySources

identify sources available for a given metric

        @param {String} name - name of the metric
        @param {Object} query - mongodb query for filtering out metrics
            only supports date only
        @param {Function} callback - callback function
            callback(err, resultsArray)

    Metrics.indentifySources = function (name, query, callback) {}

#### Example

~~~js
	
var MONGODB_URL = "mongodb://localhost/test";
var minum = require('minum')(MONGODB_URL);

minum.aggregate('no-of-users', 'minute', 'avg', 'sum', {date: { $gte: 1361030882576 }}, function(err, result) {

});
~~~
