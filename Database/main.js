const {Client}=require('pg')
const { pool } = require("./dbConfig")
const express = require('express')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
const transporter = require('./Emailconfig')
const crypto = require('crypto')
const path = require('path')

const initializePassport = require('./passportConfig')

initializePassport(passport)

const app=express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});




const cors = require('cors')
const { error } = require('console')
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

app.post('/postData', async (req,res)=>{
    const{login,email,password, password2} = req.body

    let errors = []

    if(!login || !email || !password || !password2) {
        errors.push({ message: "Entrez tout les champs s'il vous plaît"})
    }

    if(password.length < 6){
        errors.push({ message: "Le mot de passe doit faire au moins 6 caractères"})
    }

    if(password != password2){
        errors.push({ message: "Les mots de passes entrés sont différents"})
    }

    if(errors.length > 0 ){
        return res.render('register', {errors})
    }else{
        //pas d'erreurs => on valide le formulaire
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        let hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword)


                // 1. Vérifie login
        con.query('SELECT * FROM public."UserHotel" WHERE login = $1', [login], (err, result) => {
            if (err) return res.send(err);

            if (result.rows.length > 0) {
                return res.render('register', {
                    errors: [{ message: "Ce login est déjà utilisé" }]
                });
            }

            // verif mail
            con.query('SELECT * FROM public."UserHotel" WHERE email = $1', [email], (err, result) => {
                if (err) return res.send(err);

                if (result.rows.length > 0) {
                    return res.render('register', {
                        errors: [{ message: "Cet email est déjà utilisé" }]
                    });
                }

                // hash mdp et insert
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) return res.send(err);

                    const insert_query = 'INSERT INTO public."UserHotel" (login,email,password,verification_token) VALUES ($1,$2,$3,$4)';
                    con.query(insert_query, [login, email, hashedPassword, verificationToken], (err, result) => {
                        if (err) return res.send(err);

                        const verifyLink = `http://localhost:3000/verify-email/${verificationToken}`

                        transporter.sendMail({
                            from: '"Mon App" <TemplarHotelVerif@gmail.com>',
                            to: email,
                            subject: 'Vérifiez votre adresse email',
                            html: `<p>Cliquez ici pour vérifier votre compte : <a href="${verifyLink}">${verifyLink}</a></p>`
                        });

                        req.flash("success_msg","Vous êtes inscrits")
                        res.redirect('/users/login')
                    });
                });
            });
        });
    }
})

app.post('/users/login', passport.authenticate('local', {
    successRedirect: '/users/dashboard',

    failureRedirect: '/users/login',
    failureFlash: true
}))

app.get('/verify-email/:token', (req, res) => {
    const { token } = req.params;

    const query = `
        UPDATE public."UserHotel"
        SET is_verified = true, verification_token = null
        WHERE verification_token = $1
        RETURNING *;
    `;

    con.query(query, [token], (err, result) => {
        if (err) return res.send("Erreur de vérification");
        if (result.rows.length === 0) {
            return res.send("Lien invalide ou déjà utilisé");
        }

        res.send("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
    });
});



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


app.get('/', (req,res) => {
    res.render('index')
})

app.get('/users/register', (req,res)=>{
    res.render('register', {
        errors: [],
        success_msg: req.flash('success_msg')
    })
})

app.get('/users/login', (req,res)=>{
    res.render('login')
})

app.get('/users/dashboard', (req,res)=>{
    res.render('dashboard', {user: req.user.login})
})

app.get("/users/logout", (req,res) => {
    req.logOut(function(err) {
        if (err) { return next(err); }
        req.flash("success_msg", "You have successfully logged out.");
        res.redirect("/users/login");
    });
});


/*con.query('Select * from userdemo',(err,res)=>{
    if(!err)
        {
            console.log(res.rows)
        }else{
            console.log(err.message)
        }
        con.end();
})*/