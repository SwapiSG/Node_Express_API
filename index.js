const express = require('express');
// const data = require('./data');
const bodyParser = require('body-parser');
// const fs = require('fs');
// var logger = fs.createWriteStream('NewData.txt', {
//     flags: 'a' // appending
//   })
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
const port = 3000;

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql09",
    multipleStatements: true
});

con.connect(err => {
    if (err) throw err;
})

// app.get("/", (req, res) => { // return result in JSON
//     if(Object.keys(req.query).length === 0){
//         let result = data.getStatesOfFirstCountry();
//         res.json(result);
//     }else{
//         let states = data.getStates(req.query.code);
//         res.json(states);
//     }
// });

// app.post("/", (req, res) => { // Save result in a textfile
//     let obj = {
//         name: req.body.country,
//         code: req.body.code,
//         state: req.body.state
//     }
//     let input = JSON.stringify(obj);
//     logger.write(input);
//     res.end(`${input} successfully added`);
// });

app.get("/", (req, res) => { // Use MySQL database
    con.query("USE data");
    if (Object.keys(req.query).length === 0) {
        con.query("SELECT countries.code, country, state FROM countries JOIN states ON countries.code = states.code", (err, result) => {
            if (err) throw err;
            res.json(result);
        });
    } else {
        con.query("SELECT countries.code, country, state FROM countries JOIN states ON countries.code = states.code WHERE countries.code = ?", [req.query.code], (err, result) => {
            if (err) throw err;
            let errorMsg = '';
            let status = 'success';
            if(result.length == 0){
                errorMsg = "Invalid country code entered";
                status = 'error';
            }
            let output = {
                "data": result,
                "error": errorMsg,
                "status": status
            }
            res.json(output);
        });
    }
});

app.post("/", (req, res) => {
    con.query("USE data");
    con.query("INSERT INTO countries (code, country) VALUES (?, ?)", [req.query.code, req.body.country]);
    con.query("INSERT INTO states (code, state) VALUES (?, ?)", [req.query.code, req.body.state]);
    con.query("SELECT countries.code, country, state FROM countries JOIN states ON countries.code = states.code WHERE countries.code = ? && countries.country = ? && states.state = ?", [req.query.code, req.body.country, req.body.state], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})