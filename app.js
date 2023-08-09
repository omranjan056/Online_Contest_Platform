const express= require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
var user="";
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vikash',
});

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 1 day
  createDatabaseTable: true,
  schema: {
      tableName: 'sessions',
      columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
      }
  }
}, connection);
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    // If the user is logged in, attach the user object to the req object
    req.user = req.session.user;
    // res.redirect('/index')
    next();
  } else {
    // If the user is not logged in, redirect them to the login page
    res.redirect('/login');
  }
}
var temp = 0;
//Destroying session
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
       temp=0;
      res.redirect('/');
    }
  });
});







app.get("/", function(req, res){
 user = req.session.user;
  res.render('index', { user: user });

});
var error1 = "";

app.get("/register", function(req, res){
    res.render("register", {title:"hello", error1:error1})
  
  });

 app.get("/registration_success", function(req,res){
  res.render("registration_success", {user:user});
 })
  app.get("/message",function(req,res){
    res.render("message",{user:user})
  })

  app.get("/verification",function(req,res){
    res.render("/verification",{user:user})
  })
  app.post("/register", async function(req, res){
    const datas = req.body;
    console.log(datas);
    const f_name = datas.fName;
    const l_name = datas.lName;
    const phone = datas.mobile;
    const email = datas.email;
    const password = datas.password;
    const sql1 = 'INSERT INTO users(first_name,last_name,mobile,email, password) VALUES (?, ?, ?, ?,?)';
    const values = [f_name, l_name, phone, email, password];
    
    const sql2 = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    

    const query1 = (sql, values) => {
      return new Promise((resolve, reject) => {
        connection.query(sql, values, function(error, results, fields) {
          if (error) reject(error);
          else resolve(results);
        });
      });
    };

    const results = await query1(sql2, [email]);

    
      if(results[0].count>0 && results[0].verified==1)
      {
        error1="email already exist"
        res.render('register', {error1:error1});
      }
      else
      {
        connection.query(sql1, values, function(err, result) {
          if (err){
            throw err;
          }
          console.log('Record inserted');
        });
         
        



         var temp;
        const sql3 = 'SELECT id FROM users WHERE email = ?';
        const val = [email];
        connection.query(sql3, val, function(err, result1) {
          if (err){
            throw err;
          }
          else
          {
                temp = result1[0].id;
               

                const sql4 = 'INSERT INTO profile(UserId,Name,email,ContactDetails) VALUES (?, ?, ?, ?)';
                const val4 = [temp, f_name +" "+ l_name, email, phone];
                connection.query(sql4, val4, function(err, result2) {
                  if (err){
                    throw err;
                  }
                  else
                  console.log('Record inserted in profile table succesfully');
                });

           }
                  console.log('Record extracted');
        });

         

        res.redirect("/registration_success");
         
        
        



                
        
      }
  })

 
  
  var error3="";
  var email_id;
  app.get("/login", function(req, res){
    res.render('login', {error3:error3});
  
  });
  var email="";
  var pass1="";
  app.post('/login', function(req, res){

    const data = req.body;
    email = data.email;
    pass1= data.password;
     const userID = email;

    req.session.userID = userID;
    const sql3 = 'SELECT password FROM users WHERE email = ? AND password=?';
        connection.query(sql3, [email, pass1], function(er2,results2,field){
            if(er2)
            throw er2;
            else if(results2.length>0)
            {
              const user = results2[0];
              req.session.user = user;
              
              res.redirect('/');
            }
            else
            {
              error3 = "either password or email is wrong or have not registered yet";
              //console.log(error3);
              res.render('login', {error3:error3})
            }
            email=req.session.userID;
           
        })
    
  })
  
  app.get('/profile', requireLogin, function(req, res){

    const userID = req.session.userID;
    user = req.session.user;
    console.log(userID);
    
   
    const sql4 = 'SELECT Name, ContactDetails FROM profile WHERE email = ?';
        connection.query(sql4, [userID], function(er2,results2,field){
            if(er2)
            throw er2;
            else
            {
              console.log(results2)

              var Name =results2[0].Name;
              var contact = results2[0].ContactDetails;
              res.render('profile', {Name: Name, Phone:contact, email:userID, user:user});
            }
           
        })
    
  })
  app.get("/login", function(req, res){
    res.render('login', {error3:error3});
  
  });

  app.get("/index", function(req, res){
    res.redirect('/');
  
  });
  

  
  app.get("/problemset",requireLogin, function(req, res){
    user = req.session.user;
    res.render('problemset', {user:user});
  
  });
  


  


//Database related code
  app.get("/maths",requireLogin, function(req, res){
    user = req.session.user;
    const query = 'SELECT id, question_text, correct FROM question_details'

connection.query(query, function(error, results, fields) {
  if (error) {
    console.error(error)
    return
  } 
  res.render('maths', {
    result:results, user:user
  });
})
  
  });

  app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
  });
var message="";
var op5="";
var id3 ="";
var op1="";
var op2="";
var op3="";
var op4="";
var id2="";
var image_data="";
var question="";


// const qr2 ='SELECT COUNT(*) AS count FROM question_details';
// var count1 = "";
// connection.query(qr2, function(error, result){
//   if(error)
//   throw error;
//   count1 = result[0].count;
//   console.log(count1);
// })

  app.get('/q_details',requireLogin, function(req, res) {
    user = req.session.user;
     id3 = req.query.id;//this given from windows.href
    //console.log(id);
    // Fetch data from the database based on the ID
     


    const qr = 'SELECT * FROM question_details'
    connection.query(qr, [id3], function(error, results, fields) {
      if (error) throw error;
      // Render the details EJS file with the data
      //console.log(results);
       id2 = results[0].id;
       question = results[0].question_text;
       image_data = results[0].image_path;
       op1 = results[0].option_a;
       op2 = results[0].option_b;
       op3 = results[0].option_c;
       op4 = results[0].option_d;
       op5 = results[0].CORRECT;
       console.log(op5);
      res.render('q_details', { id:id2, question:question, image:image_data, o1:op1, o2:op2, o3:op3, o4:op4,user:user, sel:selectedOption, mess:message , total:count1});

      
    });
  });


  app.post('/q_details', function(req, res){
    res.render('q_details', { id:id2, question:question, image:image_data, o1:op1, o2:op2, o3:op3, o4:op4,user:user, sel:selectedOption, mess:message });

    
  });
  


var selectedOption="";
var clicked = "";
  // for checking which option is selected
  app.post('/selected', function(req, res) {
    selectedOption = req.body.selectedOption;
    console.log(selectedOption);
  });
  console.log(op5);

  app.get("/check", (req, res) => {
    var message = "";
    if(selectedOption=="")
    message="choose an option";
    else
    {
      if(selectedOption==op5)
      message="correct answer";
      else
      message="incorrect";
    }
    res.send(message);
    message="";
    selectedOption="";
  });
  
  

//contest page related
app.get('/confirm', (req, res) => {
  res.render("confirm");
  // res.json({
  //   color: 'red' // or whatever color the circle should be set to
  // })
})
var email1=null;
var temp1=0;


console.log(temp);

var temp2=0;
app.get('/contest' ,requireLogin,function(req, res){
  console.log(email1);
  var cnt=0;
          res.redirect('collect');
           
  
  
    
  
});

app.get('/contest1',requireLogin, function(req,res){
  var sec = 1;
  var ques = 1;
  var id = 1;
  var sql4 = 'SELECT * FROM question_details WHERE section = ? AND question_number= ?';
  connection.query(sql4, [sec, ques], function(error, results, fields) {
    if (error) {
      console.error(error);
      return;
    }
    console.log(results);
    
    res.render('contest', {
      result: results,
      user: user,
      id2 : id
    });
  });
})

app.get("/contest_success", function(req, res){
  res.render("contest_success");
})

app.get('/sec', function(req, res) {
  const section = req.query.section;
  console.log(section);
  var sql6 = 'SELECT * FROM question_details WHERE section = ?';
  connection.query(sql6, [section], function(error, results, fields) {
    if (error) {
      console.error(error);
      return;
    }
    var myresult = { result:results};
    console.log(myresult)
    res.json(myresult)
  });
  
  
   
});

app.get('/collect', (req, res) => {
  const userId = req.session.userId;
  console.log(userId)
   mesg="hi"
  res.render('collect', {mesg:mesg});


})

app.post('/collect1', function(req, res){
  const datas = req.body;
    console.log(datas);
     email1 = datas.email;
    const sql2 = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    connection.query(sql2, [email1], function(error, results, fields) {
      if (error) console.log("error");
      else if(results[0].count>0 && req.session.userID===email1)
      {
        temp2=1;
        const insertSql = 'INSERT INTO user_contest (user_id,contest_id, attended, score) VALUES (?, ?,?,?)';
        connection.query(insertSql, [req.session.userID, 1,0, 0], function(error, results, fields) {
          if (error) {
            console.error('Error inserting data into user_contest:', error);
            // Handle the error accordingly
          } else {
            console.log('Data inserted into user_contest successfully');
            // Continue with the desired logic after successful insertion
          }
        });

                    var sql6 = 'SELECT attended FROM user_contest WHERE user_id = ? AND contest_id= ?';
              connection.query(sql6, [req.session.userID, 1], function(error, results, fields) {
                if (error) {
                  console.error(error);
                  return;
                }
                console.log(results[0].attended);
                if(results[0].attended==1)
                {
                  res.render('confirm');
                }
                else
                res.redirect('/contest1');
          
              })


          
      }
      else
      {
        var error1="you are not registered with this email"
        res.render('collect', {mesg:error1});
      }
      
    });
})


app.post('/confirm1', (req, res) => {
  console.log(req.session.userID);
  var score = req.body.id1;
const insertSql = 'UPDATE user_contest SET score = ?, attended=? WHERE user_id = ? AND contest_id=?';
     connection.query(insertSql, [score,1, req.session.userID,1], function(error, results, fields) {
       if (error) {
         console.error('Error inserting data into user_contest:', error);
         // Handle the error accordingly
       } else {
        temp2=0;
         console.log('Data inserted into user_contest successfully');
         // Continue with the desired logic after successful insertion
       }
     
     

})
});


// app.get('/sec', function(req, res) {
  
//   var sql5 = 'SELECT contest_id, attended, score FROM user_contest WHERE user_id = ?';
//   var val5 = req.session.userID;
//   connection.query(sql5, val5, function(err, result2) {
//     if (err){
//       throw err;
//     }
//     else
//     {
//       console.log(result2);
//       var myresult = { result:result2};
//       console.log(myresult)
//       res.json(myresult)
      
//     }
    
//  });
  
     
  
//    // Send the retrieved data back as a JSON response
// });

//app.get('/', (req, res) => {

  // var sql5 = 'SELECT contest_id, attended, score FROM user_contest WHERE user_id = ?';
  // var val5 = req.session.userID;
  //  var cnt;
  // connection.query(sql5, val5, function(err, result2) {
  //   if (err){
  //     throw err;
  //   }
  //   else
  //   {
  //     console.log(result2);
  //     var id2={};
  //     res.json({id1:result2});
      
  //   }
    
 // });

//  res.json({
//   id2:"4" // or whatever color the circle is currently set to
// })
 
 
  
  
// })



app.get('/data', (req, res) => {
 
  var sql5 = 'SELECT contest_id, attended, score FROM user_contest WHERE user_id = ?';
  var val5 = req.session.userID;
   var cnt;
  connection.query(sql5, val5, function(err, result2) {
    if (err){
      throw err;
    }
    else
    {
      console.log(result2);
      res.json(result2);
    }
    
 });
});



app.post('/responses', requireLogin, (req, res) => {
  const response = req.body;
  const userId = req.session.userID;
  const val = [];
  console.log(userId);

  val.push(userId);
   val.push(8);

  for (var i = 1; i <= 100; i++) {
    if (!response.data.hasOwnProperty(i)) {
      val.push(0);
    } else {
      val.push(response.data[i]);
    }
  }

  const sql ='INSERT INTO contest_responses (user_id,contest_id, qs1,qs2,qs3,qs4,qs5,qs6,qs7,qs8,qs9,qs10,qs11,qs12,qs13,qs14,qs15,qs16,qs17,qs18,qs19,qs20,qs21,qs22,qs23,qs24,qs25,qs26,qs27,qs28,qs29,qs30,qs31,qs32,qs33,qs34,qs35,qs36,qs37,qs38,qs39,qs40,qs41,qs42,qs43,qs44,qs45,qs46,qs47,qs48,qs49,qs50,qs51,qs52,qs53,qs54,qs55,qs56,qs57,qs58,qs59,qs60,qs61,qs62,qs63,qs64,qs65,qs66,qs67,qs68,qs69,qs70,qs71,qs72,qs73,qs74,qs75,qs76,qs77,qs78,qs79,qs80,qs81,qs82,qs83,qs84,qs85,qs86,qs87,qs88,qs89,qs90,qs91,qs92,qs93,qs94,qs95,qs96,qs97,qs98,qs99,qs100) VALUES (? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,?)' ;
  connection.query(sql, val, function (err, result) {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Data inserted successfully in response table');
    }
  });
});




app.post('/upload', upload.single('profile-picture'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Access the uploaded file details
  const { filename, path: filePath, mimetype } = req.file;

  // Extract the file extension
  const fileExtension = path.extname(filename);

  // Generate a new filename with the original extension
  const newFilename = req.session.userID+".png";

  // Define the destination path with the new filename
  const destinationPath = path.join(__dirname, 'public', 'images', newFilename);

  // Move the file to the desired folder with the new filename
  fs.rename(filePath, destinationPath, err => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to upload file.');
    }

    // File upload successful
    res.send('File uploaded successfully.');
  });
});


app.listen(3000, function(){
   console.log("server is running on port 3000");
})