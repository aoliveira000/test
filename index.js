const bodyParser = require('body-parser');
const express = require('express');
const NodeCache = require("node-cache");
const fs = require("fs");
const { keyGen } = require("./util");

const cache = new NodeCache();
const port = 5555
const directory = "./data";

const readCity = (city, state, callback) => {
    const key = keyGen(city, state);
    const population = cache.get(key);
    if (population) return callback(null, population);

    const file = `${directory}/${key}`;
    fs.readFile(file, "utf-8", (err, population) => {
        if (population) cache.set(key, population, 60 * 5);
        callback(err, population)
    });
}

const writeCity = (city, state, population, callback) => {
    const key = keyGen(city, state);
    const file = `${directory}/${key}`;
    fs.writeFile(file, population, (err) => {
        if (!err) cache.set(key, population, 60 * 5);
        callback(err)
    });

};

const standardParams = (params) => {
    const result = {};
    Object.keys(params).forEach((key) => {
        result[key] = params[key].toLowerCase();
    });
    return result;
}

const run = () => {
    const app = express();

    app.use(bodyParser.text({ type: "*/*" }));

    app.get('/api/population/state/:state/city/:city', (req, res) => {
        const { city, state } = standardParams(req.params);
        readCity(city, state, (err, population) => {
            if (!population) return res.status(400).json({ message: "No records found" });
            return res.status(200).json({ population });
        })
    });

    app.put('/api/population/state/:state/city/:city', (req, res) => {
        const { city, state } = standardParams(req.params);
        const population = req.body;
        if (isNaN(population)) return res.status(400).json({ message: "Input must be a number" });

        readCity(city, state, (err, data) => {
            let code = 200;
            if (!data) code = 201;
            writeCity(city, state, population, (err) => {
                if (err) return res.status(400).json({ message: "An unknown error occured." });
                return res.status(code).json({ message: "Saved" });
            });
        });

    });

    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });

};

run();