const {Client}=require('pg')
const express = require('express')

const app=express()
app.use(express.json())

const cors = require('cors')
app.use(cors({
    origin: 'http://localhost',
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
  }));

const con=new Client({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"admin",
    database:"projetDevWeb"
})


con.connect().then(()=> console.log("connected"))

app.post('/postData',(req,res)=>{
    const{id,login,email,password} = req.body

    const insert_query = 'INSERT INTO public."UserHotel" (id,login,email,password) VALUES ($1,$2,$3,$4)'
    con.query(insert_query, [id,login,email,password],(err,result)=>{
        if(err)
            {
                res.send(err)
            }else{
                console.log(result)
                res.send("POSTED DATA")
            }


    })
})

app.get('/fetchData',(req,res)=>{

    const fetch_query = 'SELECT * FROM public."UserHotel"'
    con.query(fetch_query,(err,result)=>{
        if(err)
            {
                res.send(err)
            }else{
                res.send(result.rows)
            }
    })
})

app.get('/fetchbyId/:id',(req,res)=>{
    const id = req.params.id
    const fetch_query = 'SELECT * FROM public."UserHotel" WHERE id = $1'
    con.query(fetch_query,[id],(err,result)=>{
        if(err)
            {
                res.send(err)
            }else{
                res.send(result.rows)
            }
    })
})

app.put('/update/:id',(req,res)=>{
    const id = req.params.id
    const login = req.body.login

    const update_query = 'UPDATE public."UserHotel" SET login=$1 WHERE id=$2'

    con.query(update_query,[login,id],(err,result)=>{
        if(err)
            {
                res.send(err)
            }else{
                res.send("UPDATED")
                res.send(result)
            }
    })
})

app.delete('/delete/:id',(req,res)=>{
    const id = req.params.id
    const delete_query = 'DELETE FROM public."UserHotel" WHERE id = $1'
    con.query(delete_query,[id],(err,result)=>{
        if(err)
            {
                res.send(err)
            }else{
                res.send(result)
            }
    })
})

app.listen(3000,()=>{
    console.log("Server is running...")
})

/*con.query('Select * from userdemo',(err,res)=>{
    if(!err)
        {
            console.log(res.rows)
        }else{
            console.log(err.message)
        }
        con.end();
})*/