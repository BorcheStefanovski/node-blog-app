var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
//APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); //koristenje na public folder za external css i js files
app.use(methodOverride("_method"));
app.use(expressSanitizer()); //mora da se naogja pod body-parser
app.set("view engine", "ejs");

//MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//ROUTES
app.get("/", function(req, res) {
   res.redirect("/blogs"); 
});
//INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
       if(err){
           console.log("Something went wrong");
       } 
       else{
           res.render("index", {blogs:blogs});    
       }
    });
});
//NEW ROUTE
app.get("/blogs/new", function(req, res) {
   res.render("new"); 
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
   //create blog
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.create(req.body.blog, function(err, newBlog){
      if(err){
          console.log("Something went wrong");
      } else{
          res.redirect("/blogs");
      }
   });
});
//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){ // findById metod za naogjanje ID od baza - prima (ID, callbackfunkcija)
      if(err){
          res.send("Something went wrong");
      } 
      else{
          res.render("show", {blog:foundBlog});
      }
   });
});
//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
      if(err){
          res.send("Something went wrong");
      } 
      else{
          res.render("edit", {blog:foundBlog}); 
      }
   });
});
//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body); // sprechvanje da se dodavaat skripti vo vnesuvanjeto na body na postot
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
      if(err){
          res.send("Something went wrong");
      } else{
          res.redirect("/blogs/" + req.params.id);
      }
   });
});
//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
   //destroy a blog
   Blog.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.send("Something went wrong");
      } else{
          res.redirect("/blogs");
      }
   });
});



//STARTING SERVER
var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("Server is up on port 3000");
});