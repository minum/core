var assert          = require('assert');
var metricsIo       = require('../lib/metrics');
var mongojs         = require('mongojs');

var MONGO_URL = "mongodb://127.0.0.1:27017/test-chunk";
var COLLECTION = 'metrics';

var db = mongojs(MONGO_URL);

suite('Metrics', function() {

    suite('.track()', function() {

        test("tracking a metric", _clean(function(done) {

            var mm = metricsIo(MONGO_URL, COLLECTION);
            var name = 'the-name';
            var value = 'the-value';
            var source = 'the-source';
            var date = new Date('2013 01 01 4:15:23');
            mm.track(name, value, source, date, function(err) {

                assert.equal(err, undefined);
                db.collection(COLLECTION).findOne({name: name}, validateMetric);
            });

            function validateMetric(err, metric) {

                assert.equal(err, undefined);
                assert.equal(metric.name, name);
                assert.equal(metric.value, value);
                assert.equal(metric.source, source);
                assert.equal(metric.date, date.getTime());

                assert.deepEqual(metric.resolution, {
                    y: date.getUTCFullYear(),
                    mo: date.getUTCMonth(),
                    d: date.getUTCDate(),
                    h: date.getUTCHours(),
                    m: date.getUTCMinutes(),
                    s5: metricsIo._roundToNear(date.getUTCSeconds(), 5),
                    s: date.getUTCSeconds()
                });
                done();
            }
        }));

        test("tracking a metric using the constructor", _clean(function(done) {

            var mm = new metricsIo(MONGO_URL, COLLECTION);
            var name = 'the-name';
            var value = 'the-value';
            var source = 'the-source';
            var date = new Date('2013 01 01 4:15:23');
            mm.track(name, value, source, date, function(err) {

                assert.equal(err, undefined);
                db.collection(COLLECTION).findOne({name: name}, validateMetric);
            });

            function validateMetric(err, metric) {

                assert.equal(err, undefined);
                assert.equal(metric.name, name);
                assert.equal(metric.value, value);
                assert.equal(metric.source, source);
                assert.equal(metric.date, date.getTime());

                assert.deepEqual(metric.resolution, {
                    y: date.getUTCFullYear(),
                    mo: date.getUTCMonth(),
                    d: date.getUTCDate(),
                    h: date.getUTCHours(),
                    m: date.getUTCMinutes(),
                    s5: metricsIo._roundToNear(date.getUTCSeconds(), 5),
                    s: date.getUTCSeconds()
                });
                done();
            }
        }));
    });

    suite('.aggregate()', function() {

        test('metric avg, source sum, min resolution', _clean(function(done) {

            var metrics = [
                {name: 'mp3', value: 10, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 6, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'other', value: 6, source: 'b2', date: new Date('2012 01 01 10:46 GMT')}
            ];

            var mm = metricsIo(MONGO_URL, COLLECTION);

            addBulkMetrics(mm, metrics, function(err) {

                assert.equal(err, undefined);
                mm.aggregate('mp3', 'minute', 'avg', 'sum', validateMetrics);
            });

            function validateMetrics(err, metrics) {

                assert.equal(err, null);
                assert.deepEqual(metrics, [{ _id: { y: 2012, mo: 0, m: 45, h: 10, d: 1 }, value: 16 }]);
                done();
            }
        }));

        test('metric sum, source avg, min resolution, 2 results', _clean(function(done) {

            var metrics = [
                {name: 'mp3', value: 10, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b1', date: new Date('2012 01 01 10:46 GMT')},
                {name: 'mp3', value: 6, source: 'b2', date: new Date('2012 01 01 10:46 GMT')},
                {name: 'other', value: 6, source: 'b2', date: new Date('2012 01 01 10:46 GMT')}
            ];

            var mm = metricsIo(MONGO_URL, COLLECTION);

            addBulkMetrics(mm, metrics, function(err) {

                assert.equal(err, undefined);
                mm.aggregate('mp3', 'minute', 'sum', 'avg', validateMetrics);
            });

            function validateMetrics(err, metrics) {

                assert.equal(err, null);
                assert.deepEqual(metrics, [
                    { _id: { y: 2012, mo: 0, m: 45, h: 10, d: 1 }, value: 9 },
                    { _id: { y: 2012, mo: 0, m: 46, h: 10, d: 1 }, value: 7 },
                ]);
                done();
            }
        }));
    });

    suite('.aggregateOnlyValues()', function() {

        test('metric avg, all sources, min resolution', _clean(function(done) {

            var metrics = [
                {name: 'mp3', value: 10, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 6, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'other', value: 6, source: 'b2', date: new Date('2012 01 01 10:46 GMT')}
            ];

            var mm = metricsIo(MONGO_URL, COLLECTION);

            addBulkMetrics(mm, metrics, function(err) {

                assert.ifError(err);
                mm.aggregateOnlyValues('mp3', 'minute', 'avg', [], validateMetrics);
            });

            function validateMetrics(err, metrics) {

                assert.ifError(err);
                var expectedResult = [
                    { _id: { source: 'b1', date: { y: 2012, mo: 0, m: 45, h: 10, d: 1 }}, value: 9 },
                    { _id: { source: 'b2', date: { y: 2012, mo: 0, m: 45, h: 10, d: 1 }}, value: 7 },
                ];
                assert.deepEqual(metrics, expectedResult);
                done();
            }
        }));

        test('metric sum, only source b1, min resolution, 2 results', _clean(function(done) {

            var metrics = [
                {name: 'mp3', value: 10, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 6, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'other', value: 6, source: 'b2', date: new Date('2012 01 01 10:46 GMT')}
            ];

            var mm = metricsIo(MONGO_URL, COLLECTION);

            addBulkMetrics(mm, metrics, function(err) {

                assert.equal(err, undefined);
                mm.aggregateOnlyValues('mp3', 'minute', 'sum', ['b1'], validateMetrics);
            });

            function validateMetrics(err, metrics) {

                assert.equal(err, null);
                var expectedResult = [
                    { _id: { source: 'b1', date: { y: 2012, mo: 0, m: 45, h: 10, d: 1 }}, value: 18 }
                ];
                assert.deepEqual(metrics, expectedResult);
                done();
            }
        }));
    });

    suite('.identifySources()', function() {

        test('without query', _clean(function(done) {

            var metrics = [
                {name: 'mp3', value: 10, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 6, source: 'b2', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'other', value: 6, source: 'b2', date: new Date('2012 01 01 10:46 GMT')}
            ];

            var mm = metricsIo(MONGO_URL, COLLECTION);

            addBulkMetrics(mm, metrics, function(err) {

                assert.equal(err, undefined);
                mm.identifySources('mp3', validateMetrics);
            });

            function validateMetrics(err, results) {

                assert.equal(err, null);
                results.sort(function(a, b) {
                    return a > b;
                });
                assert.deepEqual(results, ['b1', 'b2']);
                done();
            }

        }));

        test('with query', _clean(function(done) {

            var metrics = [
                {name: 'mp3', value: 10, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b2', date: new Date('2013 01 01 10:45 GMT')},
                {name: 'mp3', value: 8, source: 'b1', date: new Date('2012 01 01 10:45 GMT')},
                {name: 'mp3', value: 6, source: 'b2', date: new Date('2013 01 01 10:45 GMT')},
                {name: 'other', value: 6, source: 'b2', date: new Date('2012 01 01 10:46 GMT')}
            ];

            var mm = metricsIo(MONGO_URL, COLLECTION);

            addBulkMetrics(mm, metrics, function(err) {

                assert.equal(err, undefined);
                mm.identifySources('mp3', {date: {$lt: new Date('2012 12 31').getTime()}}, validateMetrics);
            });

            function validateMetrics(err, results) {

                assert.equal(err, null);
                results.sort(function(a, b) {
                    return a > b;
                });
                assert.deepEqual(results, ['b1']);
                done();
            }

        }));
    });
});

function addBulkMetrics (metricsTracker, metrics, callback) {
    
    var count = 0;
    (function doInsert(err) {

        if(err) {
            callback(err);
        } else {
            var metric = metrics[count++];
            if(metric) {
                metricsTracker.track(metric.name, metric.value, metric.source, metric.date, doInsert);
            } else {
                callback();
            }
        }

    })();
}

function _clean(callback) {

    return function(done) {

        db.collection(COLLECTION).remove(afterRemoved);

        function afterRemoved (err) {
            
            if(err) {
                throw err;
            } else {
                callback(done);
            }
        }
    };    

}