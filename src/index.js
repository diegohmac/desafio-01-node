const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function getUser(username) {
  return users.find(user => user.username === username);
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.some(user => user.username === username);

  if (!userExists) {
    return response.status(400).json({
      error: "Username does not exist."
    })
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return response.status(400).json({
      error: "Username already exists."
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = getUser(username);

  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;
  const { title, deadline } = request.body;

  const user = getUser(username);

  const todo = user.todos.find(todo => todo.id === todoId);

  if (!todo) {
    return response.status(404).json({ error: `Todo with the id ${todoId} does not exist.`})
  }
  
  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;

  const user = getUser(username);
  const todo = user.todos.find(todo => todo.id === todoId);

  if (!todo) {
    return response.status(404).json({ error: `Todo with the id ${todoId} does not exist.`});
  };

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;

  const user = getUser(username);
  const todo = user.todos.find(todo => todo.id === todoId);

  if (!todo) {
    return response.status(404).json({ error: `Todo with the id ${todoId} does not exist.`});
  };  
  
  user.todos.splice(todo, 1);

  return response.status(204).json(todo);
});

module.exports = app;