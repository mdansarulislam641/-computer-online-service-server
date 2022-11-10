const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
app.use(cors())
app.use(express.json())

app.get('/',(req, res)=>{
    res.send({status:true,message:"it's works"})
})

// jwt function
function verifyJWT(req, res, next){
  
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(403).send({message:"unauthorized access"})
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token,process.env.JWT_SECRET,function(error, decoded){
    if(error){
      return res.status(401).send({message:"unauthorized access"})
    }
    req.decoded = decoded;
    next()
  })
 
}



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

// jwt token 
app.post('/jwt',(req, res)=>{
  try{
    const user = req.body ;
  const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn:'7d'})
  res.send({token})
  }
  catch(error){
    console.log(error.message)
  }
})

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
    const cursor = serviceCollection.find(query)
    const result = await cursor.limit(3).sort({createdAt:-1}).toArray() ;
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
    const result = await cursor.sort({createdAt:-1}).toArray()
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
  const result = await cursor.sort({createdAt: -1}).toArray()
  res.send(result);

})

// get one review for update review
app.get('/reviewUpdate/:id',async(req,res)=>{
try{
  const id = req.params.id ;
  const query = {_id: ObjectId(id)}
  const cursor =await reviewCollection.findOne(query)
  res.send(cursor)
}
catch(e){
  console.log(e.message)
}

})


// get only self user review
app.get('/reviews',verifyJWT,async(req, res)=>{
 const decoded = req.decoded;
if(decoded.email !== req.query.email){
  res.status(401).send({message:"unauthorized user"})
}
  let query = {}
  const email = req.query.email ;
  if(email){
    query={email:email}
  }
  const cursor = reviewCollection.find(query)
  const result = await cursor.sort({createdAt:-1}).toArray()
  res.send(result)

})

// update one review for update review
app.patch('/reviews/:id',async(req,res)=>{
  try{
    const id = req.params.id ;
    console.log(req.body)
    const cursor = await reviewCollection.updateOne({_id: ObjectId(id)} , { $set: req.body})
    res.send(cursor)
  }
  catch(e){
    console.log(e.message)
  }
  
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