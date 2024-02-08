require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/persons");
const app = express();
morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});
const morganMid = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body "
);
app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(morganMid);

const apiPath = "/api/persons";

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get(`${apiPath}/:id`, (request, response) => {
  const id = Number(request.params.id);

  if (Number.isNaN(id) || id <= 0) {
    return response.status(400).json({
      error: "Id must be a positive integer",
    });
  }

  Person.find({ id: id }).then((personFound) => {
    if (!personFound) {
      response.status(404);
      response.send("Person not found");
      return;
    }
    response.json(personFound);
  });
});

app.delete(`${apiPath}/:id`, (request, response) => {
  const id = Number(request.params.id);

  if (Number.isNaN(id) || id < 0) {
    return response.status(400).json({
      error: "Id must be a positive integer",
    });
  }

  persons = persons.filter((person) => {
    return person.id != id;
  });
  response.status(204).end();
});

app.post(apiPath, (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Bad body content. name and number must be providen",
    });
  }

  Person.find({ name: body.name }).then((personFound) => {
    if (personFound) {
      return response.status(400).json({
        error: "Name must be unique",
      });
    }
  });

  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 100000) + 1,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.get("/info", (request, response) => {
  const res = `<p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>`;
  response.send(res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
