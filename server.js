const websiteUrl = 'http://localhost:8080/';
const port = 3000;
const express = require('express');
const app = express();

app.use(express.static('public'));

app.listen(port, () => console.log(`App listening on port ${port}!`));