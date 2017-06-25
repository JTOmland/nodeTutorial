var logs = require('../controllers/logging');


(function(){
    var reporter = {};
    exports.createReport = reporter.createReport = function(reportType) {
        logs.log("debug", "Hello testfile run");
        console.log("hello");

    }

    if(!module.partent) {
        reporter.createReport(process.argv[2]);
    }
})();