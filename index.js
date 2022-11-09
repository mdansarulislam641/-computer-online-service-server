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

run()


app.listen(process.env.PORT,()=>{
    console.log(`server connected on port ${process.env.PORT}`)
})