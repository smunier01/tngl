var express = require('express');
var app = express();

app.use('/shaders/', express.static(__dirname + '/shaders/'));
app.use('/libs/', express.static(__dirname + '/libs/'));
app.use('/', express.static(__dirname + '/src/'));

app.listen(3000);
