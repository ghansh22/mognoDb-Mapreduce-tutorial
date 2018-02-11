const routes = require('express').Router();
const mongojs = require('mongojs');
const db = mongojs('mapreduce', ['classes']);
const async = require('async');

routes.get('/', (req, res) => {
    // res.send('test');

    /***************************************************************************
     * map basics
     */
    var students = [
        { name: "Dale Cooper", class: "Calculus", tests: [30, 28, 45] },
        { name: "Harry Truman", class: "Geometry", tests: [28, 26, 44] },
        { name: "Shelly Johnson", class: "Calculus", tests: [27, 26, 43] },
        { name: "Bobby Briggs", class: "College Algebra, tests: [20, 18, 35]" },
        { name: "Donna Heyward", class: "Geometry", tests: [28, 28, 44] },
        { name: "Audrey Horne", class: "College Algebra", tests: [22, 26, 44] },
        { name: "James Hurley", class: "Calculus", tests: [20, 20, 38] },
        { name: "Lucy Moran", class: "College Algebra", tests: [26, 24, 40] },
        { name: "Tommy Hill", class: "College Algebra", tests: [30, 29, 46] },
        { name: "Andy Brennan", class: "Geometry", tests: [20, 21, 38] }
    ];

    let studInfo = students.map((x) => {
        return x.name + 'is in ' + x.class;
    });
    // res.json(studInfo);


    /************************************************************************************
     reduce basics
   ******/
    let tests = [
        { score: 30 },
        { score: 28 },
        { score: 45 }
    ];

    // accenpts key, value, 
    // 1st param is for aggreagation
    // 2nd param is for iteration
    // sum is set to 0 initially
    let testSum = tests.reduce((sum, tests) => {
        return sum + tests.score;
    }, 0);
    // res.json(testSum);
});

routes.get('/mapR1', (req, res) => {
    /*************************************************************************************
     * sample map job 
     */
    var mapFunc = function () {
        for (i = 0; i < this.students.length; i++) {
            var student = this.students[i];

            // Emit gets 2 arguments being the key on which you want to group the 
            // data and the data itself
            emit(student.fName + " " + student.lName, 1);
        }
    };

    /*************************************************************************************
     * sample reduce job 
     */
    var reduceFunc = function (student, values) {
        count = 0;

        for (i = 0; i < values.length; i++) {
            count += values[i];
        }
        return count;
    };

    db.classes.mapReduce(mapFunc, reduceFunc, { out: "map_ex" });
    db.map_ex.find((err, result) => {
        if (err) { res.json(err) } else {
            if (result) {
                res.json(result);
            } else { res.json('no result!') }
        }
    });

    /*************************************************************************************
     * excluding reduce jobs
     */
    // var reduceFunc = function (student, values) {
    //     return values[0]
    // };
});

routes.get('/mapR2', (req, res) => {
    // let mapFunc = () => {
    //     emit(this.professor, 1);
    // }
    // let reduceFunc = (professor, count) => {
    //     return Array.sum(count);
    // }

    async.waterfall([
        function () {
            var mapFunc = function (callback) {
                emit(this.professor, 1);
            }
            var reduceFunc = function (professor, count) {
                return Array.sum(count);
            }
            let teacher = "Alice Jones";
            let result1 = db.classes.mapReduce(mapFunc, reduceFunc,
                { query: { professor: teacher }, out: "map_ex7" }
            );
            callback(null, result1);
        },
        function (arg1, arg2, callback) {
            db.map_ex7.find((err, result) => {
                if (err) { res.json(err) } else {
                    if (result) {
                        res.json(result);
                    } else { res.json('no result!') }
                }
            });
        }
    ],
        function(err, result){
            if(err){res.json(err)}else{
                if(result){
                    res.json(result);
                }else{res.json('no result!')}
            }
        }
    );
});

module.exports = routes;