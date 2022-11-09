const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())

app.get('/',(req, res)=>{
    res.send({status:true,message:"it's works"})
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fg2t6rb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri)

async function run(){
    try{
        client.connect()
    }
    catch(error){
        console.log(error.message)
    }
}

const serviceCollection = client.db("onlineServices").collection("serviceUser")
// post new  service or user new service add 
app.post('/service', async(req, res )=>{
  try{
    const submit = req.body ;
    const result = await serviceCollection.insertOne(submit)
    res.send(result)
  }
  catch(error){
    console.log(error.message)
  }
})

// get service for 3 item
app.get('/service',async(req, res)=>{
   try{
    const query = {};
    const cursor = serviceCollection.find(query).limit(3)
    const result = await cursor.toArray() ;
    res.send(result)
   }
   catch(error){
    console.log(error.message)
   }
})



// get service for all service item
app.get('/services/allServices',async(req, res)=>{
   try{
    const query = {};
    const cursor = serviceCollection.find(query)
    const result = await cursor.toArray()
    res.send(result);
   }
   catch(error){
    console.log(error.message)
   }

})


// service details
app.get('/service/:id',async(req, res)=>{
    const id = req.params.id;
    const query ={_id:ObjectId(id)}
    const result =await serviceCollection.findOne(query)
    res.send(result)

    
})


const reviewCollection = client.db("onlineServices").collection("userReview")
// post user review service 
app.post('/review',async(req, res)=>{
  try{
    const review = req.body ;
  const cursor = await reviewCollection.insertOne(review)
  res.send(cursor)
  }
  catch(e){
    console.log(e.message)
  }
})


// get review user 
app.get('/review',async(req, res)=>{
  const query = {}
  const cursor = reviewCollection.find(query)
  const result = await cursor.toArray()
  res.send(result)

})


// get review for a special service
app.get('/review/:id',async(req, res)=>{
  const id = req.params.id ;
  const query = {service_id: id}
  const cursor = reviewCollection.find(query)
  const result = await cursor.toArray()
  res.send(result);

})

// get only self user review
app.get('/reviews',async(req, res)=>{
  let query = {}
  const email = req.query.email ;
  // console.log(email)
  if(email){
    query={email:email}
  }
  const cursor = reviewCollection.find(query)
  const result = await cursor.toArray()
  res.send(result)

})


// delete review a single users
app.delete('/review/:id',async(req, res)=>{
 try{
  const id = req.params.id ;
  console.log(id)
  const query = {_id:ObjectId(id)}
  const cursor =await reviewCollection.deleteOne(query)
  res.send(cursor)
 }
 catch(e){
  console.log(e.message)
 }
})


run()


app.listen(process.env.PORT,()=>{
    console.log(`server connected on port ${process.env.PORT}`)
})