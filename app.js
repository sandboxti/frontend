let fetch;
const AWS = require('aws-sdk');

(async () => {
  fetch = (await import('node-fetch')).default;
})();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const tableName = 'us-west-2-table-lab-devops-changes';
const appname = 'devops-dev-frontend';  
const backendUrl = 'http://172.23.162.4:5000';  

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: 'us-west-2'  
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    res.status(500).send('Error enviando archivo');
  }
});

app.get('/getActivateColor', async (req, res) => {
  const params = {
    TableName: tableName,
    Key: {
      appname: appname,        
      activated: 'true' 
    },
  };

  try {
    const data = await dynamoDb.get(params).promise();
    
    if (data.Item) {
      const activateColor = data.Item.activated.toLowerCase() === 'true';
      res.json({ activateColor });
    } else {
      res.json({ activateColor: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo valor de DynamoDB' });
  }
});

app.post('/addUser', async (req, res) => {
  const username = req.body.username;

  try {
    const response = await fetch(`${backendUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (response.ok) {
      res.json({ message: 'Usuario agregado con éxito' });
    } else {
      res.status(500).json({ message: 'Error al agregar el usuario' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al comunicarse con el backend' });
  }
});

app.get('/getUsers', async (req, res) => {
  try {
    const response = await fetch(`${backendUrl}/users`);
    const users = await response.json();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al comunicarse con el backend' });
  }
});

app.listen(port, () => {
  console.log(`Frontend corriendo en http://localhost:${port}`);
});
