var express = require('express');
var app = express();

// app.use('/shaders/', express.static(__dirname + '/shaders/'));
// app.use('/libs/', express.static(__dirname + '/libs/'));
// app.use('/npmlibs/', express.static(__dirname + '/node_modules/'));
app.use('/', express.static(__dirname + '/'));

app.listen(3000);
