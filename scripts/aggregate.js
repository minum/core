/*
    mongo-shell script to try aggregation
*/
var result = db.metrics.aggregate([
    { $match: { name: "chunk-streams" } }, //sort by date too
    { $group: 
        {
            _id: {
                date: {
                    y: "$resolution.y",
                    mo: "$resolution.mo",
                    d: "$resolution.d",
                    h: "$resolution.h",
                    m: "$resolution.m",
                    s5: "$resolution.s5"
                },
                source: "$source"
            },
            value: {$avg: "$value"},
        }
    },
    { $group:
        {
            _id: "$_id.date",
            value: {$avg: "$value"}
        }
    },
    { $sort: {
        _id: 1
    }}
]);

printjson(result);