//Connect to MongoDB
const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://127.0.0.1:27017')
.then((client) => {
    db = client.db('proj2024MongoDB')
    coll = db.collection('lecturers')
})
.catch((error) => {
    console.log(error.message)
})

// Find all documents in the 'lecturers' collection. The list should be in sorted by ascending _id. 
var findAll = function() {
    return new Promise((resolve, reject) => {
        var lecturers = coll.find({}).sort({_id:1})
        lecturers.toArray()
        .then((documents) => {
            resolve(documents)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Deleting Lecturer - delete one lecturer from this collection that has an _id
var deleteLecturer = function(ID) {
    return new Promise((resolve, reject) => {
        console.log(`Starting delete process for lecturer ID: ${ID}`);
        
        // Check if the lecturer teaches any modules
        var deleteLecturer = coll.find({ lecturerId: ID })
        deleteLecturer.toArray()
            .then(modules => {
                if (modules.length > 0) {
                    console.log(`Lecturer ${ID} is still teaching modules:`, modules);
                    reject({ success: false, message: 'Lecturer cannot be deleted because they teach a module. L001' });
                } else {
                    // Lecturer does not teach any modules, proceed with deletion
                    return coll.deleteOne({ _id: ID });
                }
            })
            .then(result => {
                if (result && result.deletedCount === 1) {
                    console.log(`Lecturer ${ID} deleted successfully.`);
                    resolve({ success: true });
                } else {
                    console.log(`Failed to delete lecturer ${ID}.`);
                    reject({ success: false });
                }
            })
            .catch(error => {
                console.log(`An error occurred while deleting lecturer ${ID}: ${error.message}`);
                reject({ success: false, message: `An error occurred: ${error.message}` });
            });
    });
};


//Module Exports
module.exports = {findAll, deleteLecturer}