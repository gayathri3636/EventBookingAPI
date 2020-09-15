const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
const PORT = 5000;

app.get('/', (req, res) => {
    res.send({
        message:"Hello"
    })
})
app.listen(PORT, () => console.log(`server started on running on ${PORT}`));