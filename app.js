const express = require("express");
// const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();
// let items = ["DSA","Badminton","gym"];
// let workItems = []; 
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}))
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-arjyo:"+process.env.password+"@cluster0.qwodm.mongodb.net/toDoListDb",{useNewUrlParser:true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item",itemsSchema);
const item1  =  new Item({
    name: "Welcome to your to-do-list"
})

const item2  =  new Item({
    name: "Press the + button to add a new item"
});

const item3  =  new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const ListSchema = {
    name: String,
    items:[itemsSchema]
}

const List = new mongoose.model("List",ListSchema)


app.get("/", function (req, res) {
    // let today = new Date();
    // let options = {
    //     weekday : "long",
    //     day : "numeric",
    //     month : "long"
    // };
    // let day = today.toLocaleDateString("en-US", options);
    Item.find({},function(err,foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function (err) {
                if(err){
                    console.log(err);
                }
                else{
                    console.log("succesfullly saved default items to database!")
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle:"Today",newListItems:foundItems});
        }
    })
    


});

app.get("/:customListName",function (req,res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName},function (err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
            }
        }
    })
   
})

app.post("/", function(req,res){
    let itemName = req.body.newItem;
   const listName = req.body.list
    const item = new Item({
        name : itemName
    });

    if(listName == "Today"){
        item.save();
    res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        })
    }

    
})

app.post("/delete",function (req,res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function (err) {
            if(!err){
                console.log("Succesfully deleted checked item");
                res.redirect("/")
            }
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function (err,foundList) {
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
    
})

app.get("/work",function(req,res){
    
    res.render("list", {listTitle:"Work List",newListItems:workItems});
})

app.post("/work",function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.listen(port, function () {
    console.log("Server started from port 3000");
});