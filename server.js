var express = require('express');

var app = express();

app.use('/apps', express.static('./apps/'));

app.listen(3030, function () {
	console.log('app is running at port 3030');
});