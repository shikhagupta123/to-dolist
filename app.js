const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//*************** database connection*****************
mongoose.connect("mongodb+srv://shikha:Jannat1.@cluster0.mibfqzw.mongodb.net/todolistDB");
//**************** database schemas*******************
const itemsSchema = {
  name : String
}

const listSchema = {
  name : String,
  items : [itemsSchema]
}

//************* Database Models******************
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);


const item1 = new Item({
  name:"Welcom to your todolist!"
})
const item2 = new Item({
  name:"Hit + to add new item."
})
const item3 = new Item({
  name:"<-- Hit to delete an item."
})

const defaultItems = [item1, item2, item3];




app.get("/", function(req, res){

//******** for featching data from db ********

  Item.find({},(err, foundItems)=>{
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err)=>{
        if(err){
          console.log(err);
        }else{
          console.log("default items saved successfully ");
        }
      })
    }
    res.render("list",{listTitle: "Today", newListItems: foundItems});
  })


});

app.get("/:customListName", (req, res)=>{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, (err, foundList)=>{
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      }else{
        //console.log(foundList.name);
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }

    }
  })

})
app.post("/", function(req, res){
  //console.log(req.body);
  var itemName = req.body.newItem;
  var listName = req.body.list;
  const newItem = new Item({
    name : itemName
  })

  if(listName === "Today"){
    newItem.save()
    res.redirect("/");
  }else{
    List.findOne({name:listName}, (err, foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

})

app.post("/delete", (req, res)=>{
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id:id},(err)=>{
      if(err){
        console.log(err);
      }
    })
    res.redirect("/");
  }else{

    List.updateOne({name:listName},{$pull:{items:{_id:id}}},(err, foundList)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
//app.listen(port);

app.listen(port, function(){
  console.log("server has started successfully.");
});
