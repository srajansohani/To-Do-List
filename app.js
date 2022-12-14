//Setupping express
const express = require('express');
const app = express();
app.use(express.static("public"));
let port = process.env.PORT;       //port is enviorment varible as it would be updated by host - heroku 
if (port == null || port == "") {
    port = 8000;
}


//setupping bodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//for using EJS -
app.set('view engine', 'ejs');

//using lodash 
const _ = require("lodash");

//Setting up mongoose
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://srajan:Test123@cluster0.tzfqpm3.mongodb.net/todolistDB");

//Schema - the scheme of how our collection will be
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

//Creating the collection
const Item = mongoose.model('Item', itemsSchema);

//creating items
const Item1 = new Item({ name: 'Welcome to the to-do-List' });
const Item2 = new Item({ name: 'hit the + button to add an item' });
const Item3 = new Item({ name: '<-- hit this to delete the an item' });
const defaultArray = [Item1, Item2, Item3];


//Creating a new collection which will store items for every page
const listSchema = {
    name: String,
    Items: [itemsSchema]
}
const List = mongoose.model('list', listSchema);





//Implementing today's days
var listTitle;
function EvaluateToday() {
    const today = new Date();
    var options = {
        weekday: "long", day: "numeric", month: "long"
    }
    var day = ""; listTitle = "Home";
    day = today.toLocaleDateString("en-US", options);
    return day;
}



app.get('/', function (req, res) {
    // Adding date to  a variable named day today
    const day = EvaluateToday();

    Item.find((err, foundItems) => {
        if (err) {
            console.log(err);
        }
        else {
            if (foundItems.length == 0) { // this if written as is uservisit same page multile times the data will be inserted multiple times in the collection
                //Inserting items
                Item.insertMany(defaultArray, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("Succesfully Inserted Items");
                    }
                })
                res.redirect('/');
            }
            else {

                res.render('List', { day: day, newItems: foundItems, listTitle: listTitle });
            }
        }
    })

})

//For Multiple lists


app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    const day = EvaluateToday();
    listTitle = customListName;
    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //Does not exist create new list
                const list = new List({
                    name: customListName,
                    Items: defaultArray
                })
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                //exist - show existing list
                res.render('List', { day: day, newItems: foundList.Items, listTitle: listTitle });
            }
        }
    });
})


app.post('/', (req, res) => {
    const listName = req.body.list;
    console.log(req.body.list);
    if (listName === "Home") {
        const newItem = new Item({
            name: req.body.newTask
        });

        newItem.save();

        // console.log(Items);
        res.redirect('/');
    }
    else {
        List.findOne({ name: listName }, (err, foundList) => {
            if (!err) {
                const newItem = new Item({
                    name: req.body.newTask
                });
                console.log(req.body);
                foundList.Items.push(newItem);
                foundList.save();
                res.redirect('/' + listName);
            }
            else {
                console.log(err);
            }
        })
    }
})


app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Home") {
        Item.deleteOne({ id: checkedItemId }, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Deleted Succesfully");
                res.redirect('/');
            }
        })
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { Items: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect('/' + listName);
            }
        })
    }

})

app.listen(port, () => {
    console.log('listening on port 3009');
})
