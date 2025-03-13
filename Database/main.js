const {Client}=require('pg')

const con=new Client({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"admin",
    database:"projetDevWeb"
})


con.connect().then(()=> console.log("connected"))


con.query('Select * from userdemo',(err,res)=>{
    if(!err)
        {
            console.log(res.rows)
        }else{
            console.log(err.message)
        }
        con.end();
})