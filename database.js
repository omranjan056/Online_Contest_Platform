const mysql = require('mysql');
const fs = require('fs');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vikash',
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
  });
  
  // var path = "/images/gk2.png"
  // var id = 9;
  // const sql = "UPDATE contest SET image_path = ? WHERE id = ? "
  // var values = [path, id];
  // connection.query(sql, values, (error, results, fields) => {
  //   if (error) throw error;
  //   console.log('Successfully updated value.');
  // });
  // connection.end(function(err) {
  //         if (err) throw err;
  //         console.log('Connection closed');
  //       });
  
//   var path = "/images/gk2.png"
// var question = "Directions: Study the following questions carefully and answers the questions given below:"
// var op1 = "Infosys";
// var op2 = "Wipro";
// var op3 = "Tata Consultancy Services";
// var op4 = "HCL Technologies";
// var correct = 3;
// var sec = 4
// var q_no = 30;


// const sql = 'INSERT INTO contest(section,question_number,question_text, option_a,option_b,option_c,option_d,correct,image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
// const values = [sec, q_no, question, op1, op2, op3, op4, correct,path];
// connection.query(sql, values, function(err, result) {
//     if (err) throw err;
//     console.log('Record inserted');
//   });
//   connection.end(function(err) {
//       if (err) throw err;
//       console.log('Connection closed');
//     });

//insert the data into the database using a prepared statement
// const sql = 'INSERT INTO options(option1,option2,option3,option4,question_id, correct) VALUES (?, ?, ?, ?,?,?)';
// const o1 = '10';
// const o2 = '20';
// const o3 = '30';
// const o4 = '12';
// const values = [o1, o2, o3, o4, 6, 1];
// connection.query(sql, values, function(err, result) {
//   if (err) throw err;
//   console.log('Record inserted');
// });
// connection.end(function(err) {
//     if (err) throw err;
//     console.log('Connection closed');
//   });