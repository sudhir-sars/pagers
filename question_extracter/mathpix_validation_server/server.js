const express = require('express');
const bodyParser = require('body-parser');
const { mathpixValidator } = require('./mathpixValidator.server');
const moment = require('moment-timezone');

const app = express();
const port = process.env.PORT || 3005;

app.use(bodyParser.json());
let total_req=1
app.post('/validate', async (req, res) => {
    const { inputText } = req.body;
    const requestTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    console.log("total_req: ",total_req++);

    if (!inputText) {
        console.error("Received request with missing or empty inputText:", req.body);
        return res.status(400).json({ error: "Missing 'inputText' in request body" });
    }

    try {
        const valid = await mathpixValidator(inputText);
        if (!valid) console.log("Validation failed for inputText:", inputText);
        return res.json({ valid });
    } catch (error) {
        console.error("Error during validation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Mathpix Validator Express server is running on port ${port}`);
});
