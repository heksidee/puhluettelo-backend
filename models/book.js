const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

/*if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]*/

const url = process.env.MONGODB_URI

console.log("connecting to", url)
mongoose.connect(url)
    .then(result => {
        console.log("connected to MongoDB")
    })
    .catch((error) => {
        console.log("error connecting to MongoDB", error.message)
    })

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

phoneBookSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

/*const Phonebook = mongoose.model("Person", phoneBookSchema)

const phonebook = new Phonebook({
    name: name,
    number: number,
})

if (process.argv.length === 5) {
    phonebook.save().then(result => {
       console.log(`added ${name} number ${number} to phonebook`) 
       mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
    Phonebook.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}*/

module.exports = mongoose.model("Person", phoneBookSchema)