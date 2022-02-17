const express = require('express');
const router = express.Router();
const db = require ('../../db/connection');
const inputCheck = require('../../utils/inputCheck');


//return data from ALL candidates table in MySQL
router.get("/candidates", (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                  AS party_name
                  FROM candidates
                  LEFT JOIN parties
                  ON candidates.party_id = parties.id`;
  
    db.query(sql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: rows,
      });
    });
  });
  
  //GET a single canidate!
  router.get("/candidate/:id", (req, res) => {
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
        message: "success",
        data: row,
      });
    });
  });
  
  // Update a candidate's party
  router.put("/candidate/:id", (req, res) => {
    // Candidate is allowed to not have party affiliation
    const errors = inputCheck(req.body, "party_id");
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
  
    const sql = `UPDATE candidates SET party_id = ? 
                   WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        // check if a record was found
      } else if (!result.affectedRows) {
        res.json({
          message: "Candidate not found",
        });
      } else {
        res.json({
          message: "success",
          data: req.body,
          changes: result.affectedRows,
        });
      }
    });
  });
  
  //DELETE a candidate
  //must use DELETE instead of GET
  router.delete("/candidate/:id", (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    //assigned req.params.id to param
    const params = [req.params.id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.statusMessage(400).json({ error: res.message });
      } else if (!result.affectedRows) {
        res.json({
          message: "Candidate not found",
        });
      } else {
        res.json({
          message: "deleted",
          changes: result.affectedRows,
          id: req.params.id,
        });
      }
    });
  });
  
  //CREATE a candidate
  //add the values that are assigned to the params
  //4 placeholders must match the 4 values
  router.post("/candidate", ({ body }, res) => {
    //use 'body' to pull property out the reqest obj
    //req.body to populate  candidate data
    //inputCheck provided by front end, added import on top of page
    //to avoid error.
    const errors = inputCheck(
      body,
      "first_name",
      "last_name",
      "industry_connected"
    );
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
        message: "success",
        data: body,
      });
    });
  });

  module.export = router;