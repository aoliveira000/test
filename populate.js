const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const { keyGen } = require("./util");

const directory = "./data";

const run = () => {
    console.log("Flushing old data");
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });

    let count = 0;

    const stream = fs.createReadStream("./city_populations.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }));

    stream.on("data", (row) => {
        count++;
        const city = (row[0]).toLowerCase();
        const state = (row[1]).toLowerCase();
        const population = row[2];
        const key = keyGen(city, state);
        const file = `${directory}/${key}`;
        fs.writeFile(file, population, (err) => {
            if (err) throw err;
        });
    });

    stream.on("end", () => {
        console.log(`There are ${count} total entries.`);
        process.exit();
    })

    stream.on("error", (err) => {
        console.log(err);
    });


};

run();