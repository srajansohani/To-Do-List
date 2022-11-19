const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT;
app.set('view engine', 'ejs');
app.use(express.static("public"));
var Items = [];
var workItems = [];
var list = "";
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", function (req, res) {
    // Adding date to  a variable named day today
    const today = new Date();
    var options = {
        weekday: "long", day: "numeric", month: "long"
    }
    var day = ""; list = "Home";
    day = today.toLocaleDateString("en-US", options);
    res.render('List', { day: day, newItems: Items, listTitle: list });

})
app.get('/work', (req, res) => {
    const workHeading = "Work List"; list = "WorkList";
    res.render('List', { day: workHeading, newItems: workItems, listTitle: list });

})
app.post('/', (req, res) => {
    const item = req.body.newTask;
    if (req.body.button === "Home") {
        Items.push(req.body.newTask);
        console.log(Items);
        res.redirect('/');
    }
    else {
        workItems.push(req.body.newTask);
        res.redirect('/work');
    }
    console.log(req.body);


})

app.listen(port, () => {
    console.log('listening on port 3009');
})
