const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});
const morganMid = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body "
);
app.use(cors());
app.use(express.json());
app.use(morganMid);

const apiPath = "/api/persons";

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get(`${apiPath}/:id`, (request, response) => {
  const id = Number(request.params.id);

  if (Number.isNaN(id) || id <= 0) {
    return response.status(400).json({
      error: "Id must be a positive integer",
    });
  }
  const personFound = persons.find((person) => {
    return person.id === id;
  });
  if (!personFound) {
    response.status(404);
    response.send("Person not found");
    return;
  }
  response.json(personFound);
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

  const personFound = persons.find((person) => {
    return person.name === body.name;
  });

  if (personFound) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 100000) + 1,
  };

  persons = persons.concat(person);

  response.json(person);
});

app.get("/info", (request, response) => {
  const res = `<p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>`;
  response.send(res);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
