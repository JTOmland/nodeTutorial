vsapp.factory('Utilities',
    ['$rootScope', function ($rootScope) {

        var service = {
            factorial: factorial,
            combin: combin
        }
        var f = [];

        function factorial(n) {
            if (Number.isInteger(n) && n > -1) {
                if (n == 0 || n == 1) {
                    return 1;
                }
                if (f[n] > 0) {
                    return f[n];
                }
                return f[n] = factorial(n - 1) * n;
            } else {
                console.log("Utilities.factorial cannot calculate factorials of non Integers such as ", n);
            }
        }

/**
* Returns the number of combinations of n choices with r selections.
* @param {n} n - Number of choices.
* @param {r} r - Number of selections
*/
function combin(n, r) {
    // !n/(!r*(n-r)!)
    if(!Number.isInteger(n) || !Number.isInteger(r)){
        console.log("combin was provided non integers of N ", n, " and R ", r);
    }
    var nFact = factorial(n);
    var nMinusRFact = factorial((n - r))
    var rFact = factorial(r)

    return nFact / (rFact * nMinusRFact)
}

return service;

    }]);



