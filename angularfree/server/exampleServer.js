/**
 * Created by bhaskar on 21/9/15.
 */
var connect = require("connect"),
    serveStatic=require("serve-static");
var path=require("path");
var app = connect();

app.use(serveStatic("../thirdexample"));
app.listen(8002);