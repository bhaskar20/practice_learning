var connect = require("connect"),
    serveStatic=require("serve-static");
var path=require("path");
var app = connect();

app.use(serveStatic("../sportstore"));
app.listen(8001);
