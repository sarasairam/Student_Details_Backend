const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
// var fs = require('fs');
const cors = require('cors')

const dbPath = path.join(__dirname, "database.db");
let db = null;
const PORT = process.env.PORT || 3000;

db = new sqlite3.Database("./database.db",sqlite3.OPEN_READWRITE, (err)=>{
        if(err){
            return console.error(err.message)
        }
        else{
            console.log("Connection sucessfull")
        }
    })

const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      app.listen(PORT, () => {
        console.log(`Server Running at http://localhost:${PORT}/`);
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };
  
  initializeDBAndServer();

// // CREATE TABLE
// const sql = `CREATE TABLE users (first_name VARCHAR(200),last_name VARCHAR(200),phone_number VARCHAR(14),email VARCHAR(200),id INTEGER)`
// db.run(sql,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A New Table is Created")
//     }
// }) 

app.use(cors());

// get all users from table
app.get("/all-students/", async(request, response) => {
    const getQuery = `
    SELECT * FROM users;`
    const data = await db.all(getQuery) 
    response.send(data);
  });

// Add new user to table
app.post("/new-student/", async (request,response)=>{
    const {firstName,lastName,phoneNumber,email,id} = request.body;
    const getUserQuery = `SELECT * FROM users WHERE phone_number = '${phoneNumber}';`;
    const dbUser = await db.get(getUserQuery);
    if(dbUser===undefined){
        const sqlpost = `INSERT INTO users (first_name,last_name,phone_number,email,id)
            VALUES ('${firstName}','${lastName}','${phoneNumber}','${email}',${id})`   
        await db.run(sqlpost)
        response.send(JSON.stringify(`New Entry Created for ${firstName} ${lastName}`))
    }else{
        response.send(JSON.stringify("User already Exits"))
    }
  }
    )


// Delete user from table
app.post("/remove-student",async(request,response)=>{
    const {id} = request.body
    const getUserQuery = `SELECT * FROM users WHERE id = '${id}';`;
    const dbUser = await db.get(getUserQuery);
    if(dbUser!==undefined){
        const deleteQuery = `
   DELETE FROM users WHERE id = '${id}';`
    await db.run(deleteQuery) 
    response.send(JSON.stringify(`Entry deleted for Student-ID ${id}`));   
    }else{
        response.send(JSON.stringify("Student-Id does'nt exist"));
    }
})

// const query = 'DROP TABLE users'
// db.run(query)