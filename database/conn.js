

var mysql = require("mysql")
var snowflake = require("snowflake-sdk")

require('dotenv').config();

var conn = snowflake.createConnection({
    account: "kq82275.ap-south-1.aws",
    username: "*****",
    password: "********",
    role: "ACCOUNTADMIN",
    database: "DEMO_DB",
    schema: "PUBLIC"
})

conn.connect((err) => {
    if (err) throw err;
    console.log("Database Connected...")
})

module.exports = conn;
