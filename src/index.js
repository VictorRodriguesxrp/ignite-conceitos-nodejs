const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username.toUpperCase() === username.toUpperCase());
  
  if (!user) {
    return response.status(400).json({
      error: "Customer not found!"
    })
  }
  
  //exportando o user para poder ser utilizado nos métodos pós checkExists.
  request.user = user;

  return next();
}

function checkExistsUserTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos;

  const todo = todos.find(todo => id === todo.id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlredyExists = users.some((user) => user.username.toUpperCase() === username.toUpperCase());

  if(userAlredyExists) {
    response.status(400).json({
      error: "Customer already exists!"
    })
  } 
   
  const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    //informar na requisição ANO-MÊS-DIA
    deadline: new Date(deadline),
    created_at: new Date(), 
  }
  
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsUserTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsUserTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;
 
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsUserTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo.id, 1);
  return response.status(204).json(user.todos);
});

module.exports = app;

