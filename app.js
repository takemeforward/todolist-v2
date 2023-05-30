//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect('mongodb://127.0.0.1:27017/todolistDB') // connection to local database
  // .then(() => console.log('Connected!'));
mongoose.connect('mongodb+srv://takemeforward:ERRORinPASSWORD30@cluster0.yi2ewuw.mongodb.net/todolistDB')
.then(()=> console.log('Database connected!'));
  const itemsSchema = new mongoose.Schema({
    name: {
      type: String,
      require: true
    }
  });

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    name: "Welcome to todolist"
  });
  const item2 = new Item({
    name: "Hit + to add new item"
  });
  const item3 = new Item({
    name: "<----Hit to remove items"
  });

  const defaultItems = [item1, item2, item3]

  const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
  });

  const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    Item.find().then((docs, err)=>{
      if(err){
        console.log(err);
      }else{
        if(docs.length===0){
          Item.insertMany(defaultItems);
        }
        res.render("list", {listTitle: "Today", newListItems: docs});
      }
    });
});

app.get("/:customListName",(req, res)=>{
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then((docs,err)=>{
    if(err){
      console.log(err);
    }else{
       if(docs===null){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect(`/${customListName}`);
      }else{
        // show an existing list
        res.render("list", {listTitle: docs.name, newListItems: docs.items})
      }
    }
   
  })
  
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;

  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((docs)=>{
      docs.items.push(item);
      docs.save();
      res.redirect(`/${listName}`);
    }).catch((err)=>{
      console.log(err);
    })
  }
  
  
});

app.post("/delete",(req, res)=>{
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(itemId).then(()=>{
    console.log("Item removed")
  }); 
  res.redirect("/");
  }else{
    List.findOneAndUpdate(
      {name: listName}, {$pull: {items: {_id: itemId}}}
    ).then((result)=>{
      console.log("Update list result is ", result);
      res.redirect(`/${listName}`);
    }).catch((err)=>{
      console.log("Error thrown is ", err);
    })
  }
  
 
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
