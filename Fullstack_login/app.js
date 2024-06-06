var express = require('express')
var cors = require('cors')
require('dotenv').config()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const saltRounds = Number(process.env.SALT_ROUNDS);
const port = process.env.Port;

// Config 
var app = express()
app.use(cors())

// Database Connection
const mysql = require('mysql2')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'mydb',
});


// Register
app.post('/register', jsonParser, function (req, res, next) {
    const email = req.body.email;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const password = req.body.password;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const errors = [
        { condition: !email, message: "Email is required" },
        { condition: !password, message: "Password is required" },
        { condition: !fname, message: "Firstname is required" },
        { condition: !lname, message: "Lastname is required" },
        { condition: !emailRegex.test(email), message: "Email must be English" },
        { condition: !passwordRegex.test(password), message: "Password must be at least 6 characters long and contain both letters and numbers" }
    ];   
    for (const error of errors) {
        if (error.condition) {
            res.json({ status: "error", message: error.message });
            return;
        }
    }
    connection.execute(
        'SELECT * FROM user WHERE email = ?',
        [email],
        function (err, user, fields) {
            if (err) {
                res.json({ status: "error", message: err.message });
                return;
            }
            if (user.length !== 0) {
                res.json({ status: 'error', message: 'This email is already in use' });
                return;
            }

            bcrypt.hash(password, saltRounds, function (err, hash) {
                if (err) {
                    res.json({ status: "error", message: `Cannot hash password: ${err.message}` });
                    return;
                }

                connection.execute(
                    'INSERT INTO user (email, password, fname, lname) VALUES (?, ?, ?, ?)',
                    [email, hash, req.body.fname, req.body.lname],
                    function (err, results, fields) {
                        if (err) {
                            res.json({ status: "error", message: err.message });
                            return;
                        }
                        res.json({ status: "ok" });
                    }
                );
            });
        }
    );
});


// Login
app.post('/login', jsonParser, function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password
    if (!email) {
        res.json({ status: "error", message: "Email is required" });
        return;
    }

    if (!password) {
        res.json({status: "error", message: "Password is required"})
        return
    }
    connection.execute(
        'SELECT * FROM user WHERE email=?',
        [email],
        function (err, user, fields) {
            if (err) {
                res.json({ status: "error", msg: err });
                return;
            }
            if (user.length === 0) {
                res.json({ status: 'error', message: 'no user found' });
                return;
            }

            bcrypt.compare(req.body.password, user[0].password, function (err, isLogin) {
                if (isLogin) {
                    const token = jwt.sign({ email: user[0].email }, secret, { expiresIn: '1h' });
                    res.json({ status: "ok", message: "login Success", token});
                } else {
                    res.json({ status: "error", message: "login failed" });
                }
            });
        }
    );
});


// Authentication
app.post('/authen', jsonParser, function (req, res, next) {
    try{
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, secret);
        res.json({status:"ok", decoded})
    } catch(err){
        res.json({status:"err", msg:err.message})
    }
    
})

// Reset- password
app.patch('/resetpassword', jsonParser, function (req, res, next) {
    const email = req.body.email;
    const newPassword = req.body.password;
    const newPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    const errors = [
        { condition: !email, message: "Email is required" },
        { condition: !newPassword, message: "New Password is required" },
        { condition: !newPasswordRegex.test(newPassword), message: "New Password must be at least 6 characters long and contain both letters and numbers"} 
    ]
    for (const error of errors) {
        if (error.condition) {
            res.json({ status: "error", message: error.message });
            return;
        }
    }
    connection.execute(
        'SELECT * FROM user WHERE email = ?',
        [email],
        function(err, user, fields) {
            if (err) {
                res.json({status: "error", message: "Problem in patching"})
                return
            }
            if (user.length === 0){
                res.json({status: "error", message: "Not found user to patch password"})
                return
            } else {
                bcrypt.hash(newPassword, saltRounds, function (err, hash) {
                    if (err) {
                        res.json({ status: "error", message: `Cannot hash password: ${err.message}` });
                        return;
                    }
                    connection.execute(
                        'UPDATE user SET password = ? WHERE email = ?',
                        [hash, email],
                        function(err, result) {
                            if (err) {
                                console.error('Error updating password:', err);
                                res.json({ status: "error", message: "Problem in updating password" });
                                return;
                            }                      
                            res.json({ status: "ok", message: "Password updated successfully"});
                        }
                    );
                })
            }
        }
    )   
});


// Run server
app.listen(port,function () {
  console.log(`CORS-enabled web server listening on port ${port}`)
})