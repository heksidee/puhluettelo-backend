require("dotenv").config()
const express = require("express");
const Phonebook = require("./models/book")
const morgan = require("morgan");


const app = express()


app.use(express.json());

morgan.token("body", (request) => JSON.stringify(request.body));
app.use(morgan(":method :url: :status :res[content-length] - :response-time ms :body"));

app.use(express.static('dist'))

let phoneBook = [
    { 
        id: "1", 
        name: 'Arto Hellas', 
        number: '040-123456' 
    },
    { 
        id: "2", 
        name: 'Ada Lovelace', 
        number: '39-44-5323523' 
    },
    { 
        id: "3", 
        name: 'Dan Abramov', 
        number: '12-43-234345' 
    },
    { 
        id: "4", 
        name: 'Mary Poppendieck', 
        number: '39-23-6423122' 
    }
]

let phoneBookLength = `Phonebook has info for ${phoneBook.length} people`
let options = { 
  timeZone: "Europe/Helsinki", 
  weekday: "short", 
  year: "numeric", 
  month: "short", 
  day: "numeric", 
  hour: "2-digit", 
  minute: "2-digit", 
  second: "2-digit", 
  timeZoneName: "longOffset"
};
let dateNow = new Date().toLocaleString("en-US", options);

app.get("/api/persons", (request, response) => {
    Phonebook.find({}).then(phonebook => {
        response.json(phonebook)
    })
    
})

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id
    const person = phoneBook.find(person => person.id === id)
    console.log(person)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id
    phoneBook = phoneBook.filter(person => person.id !== id)
    response.status(204).end()
})

app.post("/api/persons", (request, response) => {
    const body = request.body;
    const existingPerson = phoneBook.find(person => person.name === body.name)

    if (!body.name || !body.number) {
        return response.status(400).json({ error: "Name and number are required" })
    }
    if (existingPerson) {
        return response.status(400).json({ error: "name must be unique" })
    }

    const id = Math.floor(Math.random() * 100) + 5;

    const newPerson = {
        id: id.toString(),
        name: body.name,
        number: body.number
    };
    phoneBook.push(newPerson)
    response.status(201).json(newPerson);
})

app.get("/info", (request, response) => {
    response.send(`${phoneBookLength}<br>${dateNow}`);
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
