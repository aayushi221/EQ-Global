var express = require('express');
var router = express.Router();
var mysql = require("mysql")
var snowflake = require("snowflake-sdk")
var bcrypt = require("bcrypt")
var conn = require("../database/conn");

const { validator } = require("../validator");
var app = express();

//res.header("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
//res.header("Pragma", "no-cache"); // HTTP 1.0.
//res.header("Expires", "0"); 

var login = false;

app.use(function(req, res, next) {
  if (!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

/* GET home page. */
router.get('/', (req, res, next) => {
  if(req.session.flag == 1) {
    req.session.destroy();
    res.render('index', { title: 'EQ_GLobal', message : 'Email Already Exists.', flag : 1 });
  }
  else if(req.session.flag == 2) {
    req.session.destroy();
    res.render('index', { title: 'EQ_GLobal', message : 'Registration Successfully Completed. Please login!', flag : 0 });
  }
  else if(req.session.flag == 3) {
    req.session.destroy();
    res.render('index', { title: 'EQ_GLobal', message : 'Confirm Password Does not Match.', flag : 1 });
  }
  else if(req.session.flag == 4) {
    req.session.destroy();
    res.render('index', { title: 'EQ_GLobal', message : 'Incorrect Email OR Password.', flag : 1 });
  }
  else if(req.session.flag == 5) {
    req.session.destroy();
    res.render('index', { title: 'EQ_GLobal', message : 'Please Login your Account.', flag : 1 });
  }
  else if(req.session.flag == 6) {
    req.session.destroy();
    res.render('index', { title: 'EQ_GLobal', message : "Form Validation Error", flag : 1 });
  }
  else {
    if(login == true){
      res.render('index', { title: 'EQ_GLobal' , login : true, message : "Already Logged in!" , role : role});
    }
    else{
      res.render('index', { title: 'EQ_GLobal'});
    }
  }
});

/* Authentication for registration */
router.post("/auth_reg", validator, (req, res, next) => {
  var fullname = req.body.fullname;
  var email = req.body.email;
  var password = req.body.password;
  var cpassword = req.body.cpassword;

  if(password == cpassword) {
    var sql = 'select * from user where email = ?;';

    conn.execute(sql,[email], (err, result, fields) => {
      if (err) throw err;

      if(result.length > 0) {
        req.session.flag = 1;
        res.redirect('/');
      }
      else {
        // var hashPassword = bcrypt.hashSync(password, 10);
        var sql = 'insert into user(fullname, email, password) values (?,?,?);';
        conn.execute(sql, [fullname, email, password], (err, result, fields) => {
          if(err) throw err;
          req.session.flag = 2;
          res.redirect('/');
        })
      }
    })
  }
  else {
    req.session.flag = 3;
    res.redirect('/');
  }
})
var fullname = '';
var role = '';

/* Authentication for login */
router.post('/auth_login', (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  email = "'" + email + "'";

  conn.execute({
    sqlText: ('select * from user where email =' + email +''),
    complete: function(err, stmt, rows) {
      if (err) {
        req.session.flag = 4;
      res.redirect("/")
        console.error('Failed to execute statement due to the following error: ' + err.message);
      } 
      else if(rows.length == 0){
        req.session.flag = 4;
      res.redirect("/")
      }
      else if(rows.length && password == rows[0].password) {
        fullname = rows[0].FULLNAME;
        role = rows[0].PRIVILEGE;
        req.session.email = email;
        req.session.fullname = fullname;
        req.session.role = role;
        if(role == 'ADMIN'){
          login = true;
          res.redirect('/admin');
        }
        else if(role == 'Sales'){
          login = true;
          res.redirect('/sales-d');
        }
        else if(role == 'Advertisement'){
          login = true;
          res.redirect('/advertisement');
        }
      }
      else {
        req.session.flag = 4;
      res.redirect("/")
      }
    }
  });


/*
  conn.execute(sql,[email], (err, result, fields) => {
    if (err) throw err;

    // var hashedPassword = bcrypt.compareSync(password, result[0].password)
    if(result.length && password == result[0].password) {
      req.session.email = email;
      res.redirect('/home');
    }else {
      req.session.flag = 4;
      res.redirect("/")
    }
  })*/
}) 
                ////////////////Dashboards//////////////

router.get("/admin", (req, res, next) => {
  if(req.session.email && role == 'ADMIN') {
    res.render('admin', {message : role});
    //res.render('front');    
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

router.get("/sales-d", (req, res, next) => {
  if(req.session.email  && role == 'Sales') {
    res.render('sales-d', {message : role});
    //res.render('front');    
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

router.get("/advertisement", (req, res, next) => {
  if(req.session.email && role == 'Advertisement') {
    res.render('advertisement', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

                  //////////Tableau Routes/////////////

router.get("/readme", (req, res, next) => {
  if(req.session.email && (role == "ADMIN" || role == "Advertisement" || role == "Sales")) {
    res.render('readme', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})
  
router.get("/smp", (req, res, next) => {
  if(req.session.email && (role == "ADMIN" || role == "Advertisement")) {
    res.render('smp', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

router.get("/smp", (req, res, next) => {
  if(req.session.email && (role == "ADMIN" || role == "Advertisement")) {
    res.render('smp', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

router.get("/adver", (req, res, next) => {
  if(req.session.email && (role == "ADMIN" || role == "Advertisement")) {
    res.render('adver', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

router.get("/ott", (req, res, next) => {
  if(req.session.email  && (role == "ADMIN" || role == "Advertisement")) {
    res.render('ott', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

router.get("/order_detail", (req, res, next) => {
  if(req.session.email  && (role == "ADMIN" || role == "Sales")) {
    res.render('order_detail', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

router.get("/sales", (req, res, next) => {
  if(req.session.email && (role == "ADMIN" || role == "Sales")) {
    res.render('sales', {message : role});  
  }
  else {
    req.session.flag = 5;
    res.redirect("/")
  }
})

/* Logout router */
router.get("/logout", (req, res) => {
  if(req.session.email) {
    login = false;
    req.session.destroy(function() {});
    res.clearCookie('auth_login');
  }
  res.redirect("/");
})
module.exports = router;
