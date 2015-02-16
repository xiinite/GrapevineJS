module.exports = {
    'config': function (app) {
        app.locals.calctotal = function (list) {
            if (list === undefined) return "";
            var count = 0;
            list.forEach(function (item) {
                if (item.val !== undefined) {
                    count += item.val;
                } else if (item.rating !== undefined) {
                    count += item.rating;
                }
            });
            return count;
        };

        app.locals.calctotalcost = function (list) {
            if (list === undefined) return "";
            var count = 0;
            list.forEach(function (item) {
                count += item.cost;
            });
            return count;
        };
    }
}