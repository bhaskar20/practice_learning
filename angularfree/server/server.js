var connect = require("connect"),
	serveStatic=require("serve-static");
var path=require("path");
var app = connect();

app.use(serveStatic("../angularjs"));
app.listen(8000);


