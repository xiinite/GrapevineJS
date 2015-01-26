module.exports = {
    convertDateTime: function (dateTime) {
        dateTime = dateTime.split(" ");

        var date = dateTime[0].split("-");
        var yyyy = date[0];
        var mm = date[1] - 1;
        var dd = date[2];

        var time = dateTime[1].split(":");
        var h = time[0];
        var m = time[1];
        var s = parseInt(time[2]); //get rid of that 00.0;

        return new Date(yyyy, mm, dd, h, m, s);
    }
}
