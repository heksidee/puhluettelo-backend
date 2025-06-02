require("dotenv").config()
const express = require("express");
const Phonebook = require("./models/book")
const morgan = require("morgan");
const cors = require("cors");

const app = express()

app.use(cors())
app.use(express.json());

morgan.token("body", (request) => JSON.stringify(request.body));
app.use(morgan(":method :url: :status :res[content-length] - :response-time ms :body"));

app.use(express.static('dist'))

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

app.get("/api/persons/:id", (request, response, next) => {
    Phonebook.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id
    Phonebook.findByIdAndDelete(id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error));
});

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({ error: "Name and number are required" })
    }
    Phonebook.findOne({ name: body.name}).then(existingPerson => {
        if (existingPerson) {
            return response.status(400).json({ error: "name must be unique" })
        }

        const newPerson = new Phonebook({
            name: body.name,
            number: body.number
        });
    
        newPerson.save()
            .then(savedPerson => {
                response.status(201).json(savedPerson)
            })
            .catch(error => {
                console.error("Error saving person:", error);
                response.status(500).json({ error: "Internal Server Error"})
            })
    })
})

app.put("/api/persons/:id", (request, response, next) => {
    const { name, number } = request.body;
    Phonebook.findByIdAndUpdate(
        request.params.id,
        {name, number },
        {new: true, runValidators: true, context: "query"}
    )
    .then(updatedPerson => {
        if (updatedPerson) {
            response.json(updatedPerson)
        } else {
            response.status(404).json({ error: "Person not found" });
        }
    })
    .catch(error => next(error))
});

app.get("/info", (request, response) => {
    Phonebook.countDocuments({})
    .then(count => {
        let phoneBookLength = `Phonebook has info for ${count} people`
        response.send(`${phoneBookLength}<br>${dateNow}`);
    })
    .catch(error => {
        console.error("Error counting persons:", error)
        response.status(500).send("Error retrieving phonebook data")
    });
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
