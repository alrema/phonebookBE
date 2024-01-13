const express = require("express");
const app = express();

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
    response.status(400);
    response.send("Id must be a positive integer");
    return;
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
    response.status(400);
    response.send("Id must be a positive integer");
    return;
  }

  persons = persons.filter((person) => {
    return person.id != id;
  });
  response.status(204).end();
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
