require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/persons')
const app = express()
morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})
const morganMid = morgan(
  ':method :url :status :res[content-length] - :response-time ms :body '
)
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morganMid)

const apiPath = '/api/persons'

app.get(`${apiPath}`, (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => next(error))
})

app.get(`${apiPath}/:id`, (request, response, next) => {
  const id = Number(request.params.id)

  if (Number.isNaN(id) || id <= 0) {
    return response.status(400).json({
      error: 'Id must be a positive integer',
    })
  }

  Person.findOne({ id: id })
    .then((personFound) => {
      if (!personFound) {
        response.status(404)
        response.send('Person not found')
        return
      }
      response.json(personFound)
    })
    .catch((error) => {
      console.log(error)
      next(error)
    })
})

app.delete(`${apiPath}/:id`, (request, response, next) => {
  const id = Number(request.params.id)

  if (Number.isNaN(id) || id < 0) {
    return response.status(400).json({
      error: 'Id must be a positive integer',
    })
  }

  Person.deleteOne({ id: id })
    .then(response.status(204).end())
    .catch((error) => {
      console.log(error)
      next(error)
    })
})

app.post(apiPath, (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Bad body content. name and number must be providen',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 100000) + 1,
  })

  person
    .save()
    .then((savedPerson) => {
      return response.json(savedPerson).end()
    })
    .catch((error) => next(error))
})

app.put(`${apiPath}/:id`, (request, response, next) => {
  const id = Number(request.params.id)
  Person.find({ id: id }).then((personFound) => {
    if (!personFound) {
      return response.status(404).json({
        error: 'Person not found',
      })
    }
  })
  const body = request.body

  if (!body.number) {
    return response.status(400).json({
      error: 'Bad body content. name and number must be providen',
    })
  }

  Person.updateOne({ id: id }, { number: body.number }, { runValidators: true })
    .then(response.status(204).end())
    .catch((error) => {
      console.log(error)
      next(error)
    })
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const res = `<p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>`
      response.send(res)
    })
    .catch((error) => {
      console.log(error)
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
