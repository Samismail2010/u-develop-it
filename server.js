// connect mysql2 from node_modules
const inputCheck = require('./db/utils/inputCheck');
const mysql = require('mysql2')
const express = require('express');
const { result } = require('lodash');
const PORT = process.env.PORT ||3001;
const app = express();

//Express middleware
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
//connect application to the MySQL database
const db = mysql.createConnection (
    {
        host: 'localhost',
        //Your MySQL username,
        user: 'root',
        //Your MySQL password
        password: '',
        database: 'election'
    },
    console.log('Connected to the election database')
);
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    db.query(sql, (err, rows) => {
        if (err) {
            req.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

//id parameter
app.get('/api/party/:id', (req, res) => {
    const sql = 'SELECT * FROM parties WHERE id = ?';
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// delete parties api
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            // checks if anything was deleted
        } else if (!result.affectedRows) {
            res.json({
                message: 'Party not found'
            });
        } else {
            res.json ({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

//return data from ALL candidates table in MySQL
app.get('/api/candidates', (req,res) => {
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id`;
    
    db.query(sql,(err, rows) => {
    if(err){
        res.status(500).json({ error: err.message });
        return;
    }
    res.json({
        message: 'success',
        data: rows
    });
 });
});

//GET a single canidate!
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id
                WHERE candidates.id = ?`;
    //because params can be accepted in the database call as an array
    //params is assignrd to a single element
    const params = [req.params.id];
  
    db.query(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: row
      });
    });
  });

//UPDATE a candidate party
app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');
    if (errors) {
        res.status(400).json ({ error: errors });
        return;
    }
    const sql = `UPDATE candidates SET party_id = ?
    WHERE id =?`;
    const params = [req.params.party_id, req.params.id];
    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(400).json({ error: err.message })
            //check if a record was found
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json ({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});

//DELETE a candidate
//must use DELETE instead of GET
app.delete('/api/candidate/:id', (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  //assigned req.params.id to param
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.statusMessage(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
        message: 'Candidate not found'
      });
    } else {
      res.json({
        message: 'deleted',
        changes: result.affectedRows,
        id: req.params.id
      });
    }
  });
});

//CREATE a candidate
//add the values that are assigned to the params
//4 placeholders must match the 4 values
app.post('/api/candidate', ({ body }, res) => {
    //use 'body' to pull property out the reqest obj
    //req.body to populate  candidate data
    //inputCheck provided by front end, added import on top of page
    //to avoid error.
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
  VALUES (?,?,?)`;
const params = [body.first_name, body.last_name, body.industry_connected];

db.query(sql, params, (err, result) => {
  if (err) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.json({
    message: 'success',
    data: body
  });
});
  });
//Default response for any other request (Not found)
app.use((req, res) =>{
    res.status(404).end();
})
//function that starts express.js server to port 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
});