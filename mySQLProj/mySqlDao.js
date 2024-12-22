//Create a Connection Pool
var pmysql = require("promise-mysql")

var pool

pmysql.createPool({
    connectionLimit : 3,
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'proj2024mysql'
})
    .then(p => {
        pool = p
    })
        .catch(e => {
        console.log("pool error:" + e)
   })

//Function getStudents is for getting the whole student table
var getStudents = function(){
    return new Promise((resolve, reject)=> {
        pool.query('SELECT * FROM student')
        .then((data) => {
            console.log(data)
            resolve(data)
        })
        .catch((error) => {
            console.log(error)
            reject(error)
        })
   })
}   

/* Function editableStudentID is for when the different Student ID for what has showing on the student table, it 
is editable while updating student from the Update Student form */
const editableStudentID = (sid) => { 
    return new Promise((resolve, reject) => { 
        pool.query('SELECT * FROM student WHERE sid = ?', [sid], (error, results) => { 
            if (error) { 
                console.error("Error fetching student:", error)
                reject(error); 
            } else { 
                if (results.length > 0) { 
                    resolve(results[0])
                } else { 
                    reject(new Error("Student not found"));
                } 
            } 
        })
    })
}

/* Function existingStudentID is for when the same Student ID for what has showing on the student table, it 
already exists while adding student from the form */
var existingStudentID = function() { 
    return new Promise((resolve, reject) => { 
        pool.query('SELECT sid FROM student') 
        .then((data) => { 
        // Map the data to an array of IDs 
        const studentIDs = data.map(student => student.sid) 
        console.log(studentIDs) 
        resolve(studentIDs) 
    }) .catch((error) => { 
        console.log(error) 
        reject(error) 
    })
})
}

//Function of addStudents is for adding students of the student table
var addStudents = function(req) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'INSERT INTO student (sid, name, age) VALUES (?, ?, ?);',
            values: [req.body.sid, req.body.name, req.body.age] // Use req.body.sid
        };
        console.log("Executing query:", myQuery) // Log the query
        pool.query(myQuery, (error, results) => {
            if (error) {
                console.error("Error adding student: ", error)
                reject(error)
            } else {
                console.log("Student added successfully:", results)
                resolve(results)
            }
        })
    })
};

// Function of updateStudents is for updating students of the student table
var updateStudents = function(req) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'UPDATE student SET name = ?, age = ? WHERE sid = ?',
            values: [req.body.name, req.body.age, req.params.sid] // Use req.params.sid
        };
        console.log("Executing query:", myQuery)
        pool.query(myQuery, (error, results) => {
            if (error) {
                console.error("Error updating student: ", error)
                reject(error)
            } else {
                console.log("Student updated successfully:", results)
                resolve(results)
            }
        })
    })
}

/* Function of getGrades is for having a Student Name from student table, Module Name from module table, 
and Grade from grade table by joining them together using LEFT JOIN because 
it must have a NULL on the table has showing */
var getGrades = function(){
    return new Promise((resolve, reject)=> {
        pool.query('SELECT s.name as Student, m.name as Module, g.grade as Grade FROM student s LEFT JOIN grade g ON s.sid=g.sid LEFT JOIN module m ON g.mid=m.mid ORDER BY s.name ASC, g.grade ASC')
        .then((data) => {
            console.log(data)
            resolve(data)
        })
        .catch((error) => {
            console.log(error)
            reject(error)
        })
   })
}

//Module Exports
module.exports = { getStudents, editableStudentID, existingStudentID, addStudents, updateStudents, getGrades }