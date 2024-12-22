// index.js

// Import express library
const express = require('express')

// Create an Express application called 'app'
const app = express()

// Set variable port 3004, the port of the server will listen
const port = 3004

// EJS files are stored by default in a folder called views
let ejs = require('ejs');
app.set('view engine', 'ejs')

// Use Body Parser for add and updating students
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Checking for validations if there's an error on the forms
const { check, validationResult } = require('express-validator')


var mysqlDao = require('./mySQLProj/mySqlDao') // mySQL tables
var mongoDao = require('./mongoDBProj/mongoDao') // mongoDB table

//Home Page
app.get("/", (req, res)=>{
    res.sendFile(__dirname+"/homePage/home.html")
})

//Students - using mySQL
app.get("/students", (req, res)=>{
    mysqlDao.getStudents()
        .then((data) => {
        // Display data using EJS
        res.render("students", { studentList: data })
        })
        .catch((error) => {
        // Handle error
        res.send(error)
    })

})
    
// Updating Students - from updateStudent.ejs
app.get('/students/edit/:sid', async (req, res) => {
    const { sid } = req.params
    
    try {
        const student = await mysqlDao.editableStudentID(sid) // Fetch student details
        res.render("updateStudent", { student: student, sid: sid, errors: undefined })
    } catch (error) {            
        console.error("Error fetching student details:", error)
        res.status(500).send("An error occurred while fetching student details.")
    }
})    
    
app.post('/students/edit/:sid', [
    // Errors on sid
    check("sid").isLength({ min: 4 }).withMessage("Student ID should be 4 characters."),
    check("sid").custom(async (value, { req }) => {
        const student = await mysqlDao.editableStudentID(req.params.sid)
        // Student ID is not equal to the same value
        if (student.sid != value) {
            throw new Error(`Student ID is not editable.`)
        }
        // Same Student ID
        return true;
    }),

    //Error on name
    check("name").isLength({ min: 2 }).withMessage("Student Name should be at least 2 characters."),

    //Error on age
    check("age").isFloat({ min: 18 }).withMessage("Student age should be at least 18.")

], async (req, res) => {
    const studentID = req.params.sid
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render("updateStudent", {
            student: req.body,
            sid: studentID,
            errors: errors.array()
        })
    }
    
    try {
        // Update Student complete
        console.log("Updating student with ID:", studentID)
        console.log("Request body:", req.body)
        const data = await mysqlDao.updateStudents(req) // Call the updateStudents function
        console.log("Updated Student Success:", data)
        res.redirect("/students")
    } catch (err) {
        // Update student not complete
        console.error("Error updating student:", err)
        res.status(500).send("An error occurred while updating the student.")
    }
})
    
    
// Add Students - from addStudent.ejs
app.get("/students/add", (req, res) => { 
    res.render("addStudent", {errors: undefined})
})

app.post('/students/add', [
    //Errors on sid
    check("sid").isLength({ min: 4 }).withMessage("Student ID should be at least 4 characters."),
    check("sid").custom(async (value, { req }) => {
        const existingStudentIDs = await mysqlDao.existingStudentID()
        if (existingStudentIDs.includes(value)) {
            throw new Error(`Student ID ${value} already exists`)
        }
        return true;
    }),

    //Error on name
    check("name").isLength({ min: 2 }).withMessage("Student Name should be at least 2 characters."),

    //Error on age
    check("age").isFloat({ min: 18 }).withMessage("Student age should be at least 18.")
    
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render("addStudent", { errors: errors.array() })
    } else {
        console.log("Request Body:", req.body) // Log request body
        try {
            // Add student complete
            const data = await mysqlDao.addStudents(req) // Use req
            console.log("Add Student Success:", data) // Log successful insertion
            res.redirect("/students")
        } catch (err) {
            // Add student not complete
            console.error("Error adding student: ", err) // Log any error
            res.status(500).send("An error occurred while adding the student.")
        }
    }
})

//Grade - from grades.ejs & to join all three tables together
app.get("/grades", (req, res)=>{
        mysqlDao.getGrades() // Joining student, module and grade tables
    .then((data) => {
        // Display data using EJS
        res.render("grades", { gradeList: data })
    })
    .catch((error) => {
        // Handle error
        res.send(error)
    })
})

//Lecturers - using MongoDB, from lecturers.ejs
// Find all documents in the 'lecturers' collection. The list should be in sorted by ascending _id.
app.get("/lecturers", (req, res)=>{
    mongoDao.findAll()
        .then((data) => {
            res.render("lecturers", { lecturerList: data })
    })
    .catch((error) => {
        // Handle error
        res.send(error)
    })
})

// Lecturers - delete a lecturer that has an _id
app.get("/lecturers/delete/:lid", async (req, res) => {
    try {
        console.log(`Received delete request for lecturer ID: ${req.params.lid}`)
        const result = await mongoDao.deleteLecturer(req.params.lid); // For the success message
        //const result = await deleteLecturer(req.params.lid) // For the error message
        console.log('Result from deleteLecturer:', result)

        if (result.success) {
            res.status(400).send(`<a href='/'>Home</a></br><a href='/lecturers'>Lecturers</a></br><h1>Lecturer deleted successfully.</h1>`)
        } else {
            res.send('Failed to delete lecturer.')
        }
    } catch (error) {
        console.error('Caught error:', error)
        res.status(400).send(`<a href='/'>Home</a></br><h1>Error Message<br><br>Cannot delete lecturer ${req.params.lid}. He/She has associated with a modules.</h1>`)

    }
})



// Listen to port 3004
app.listen(port, () => {
    console.log(`Application listening on port 3004: http://localhost:`+port)
})