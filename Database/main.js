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
    failureRedirect: '/users/login',
    failureFlash: true
}), (req,res) =>{
    const email = req.user.email
    const now = new Date()
    con.query(
        `UPDATE public."UserHotel" SET last_login = $1 WHERE email = $2`,
        [now,email]
    )
    con.query(
        `UPDATE public."UserHotel" SET "pointsTotal" = "pointsTotal" + 0.25 WHERE email = $1`,
        [email]
    )
    con.query(
        `UPDATE public."UserHotel" SET "connectionCount" = "connectionCount" + 1 WHERE email = $1`,
        [email]
    )

    const result = con.query(`
    SELECT "pointsTotal", "userType" FROM public."UserHotel" WHERE "email" = $1`,
    [email],(err,result)=>{
        if(err) return result.send(err)

        if (result.rows.length > 0) {
            const { pointsTotal, userType } = result.rows[0]
            let newType = userType
            if (pointsTotal >= 5000 && userType !== 'admin') {
                newType = 'admin';
            } else if (pointsTotal >= 1000 && userType !== 'complexe' && userType !== 'admin') {
                newType = 'complexe';
            }
            if (newType !== userType) {
                con.query(`
                    UPDATE "UserHotel" SET "userType" = $1 WHERE "email" = $2`, 
                    [newType, email]
            )
                console.log(`Utilisateur promu : ${userType} → ${newType}`);
        }
    }
})
    const result2 = con.query(
        `SELECT "userType" FROM public."UserHotel" WHERE email = $1`,
        [email],(err,result)=>{
            const userType = result.rows[0].userType

            if (userType === 'simple') {
                return res.redirect('dashboardSimple')
            } else if (userType === 'complexe') {
                return res.redirect('dashboardComplexe')
            } else if (userType === 'admin') {
                return res.redirect('dashboardAdmin')
            }
    })
})

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

app.post('/update/:id', async (req, res) => {
    const id = req.params.id
    const { firstName, lastName, age, gender, birthDate, password } = req.body

    try {
        let update_query = `
            UPDATE public."UserHotel" SET
            "firstName" = $1,
            "lastName" = $2,
            age = $3,
            gender = $4,
            "birthDate" = $5`
        
        const params = [firstName, lastName, age, gender, birthDate]

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10)
            update_query += `, "password" = $6`
            params.push(hashedPassword)
        }

        update_query += ` WHERE id = $${params.length + 1}`
        params.push(id)

        con.query(update_query, params, (err, result) => {
            if (err) {
                req.flash('error_msg', 'Erreur lors de la mise à jour.')
                return res.redirect('/users/profil')
            }

            req.flash('success_msg', 'Profil mis à jour avec succès !')
            res.redirect('/users/profil')
        })

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Une erreur est survenue.')
        res.redirect('/users/profil')
    }
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

app.get('/users/dashboardSimple', (req,res)=>{
    res.render('dashboardSimple', {user: req.user})
})

app.get('/users/dashboardComplexe', (req,res)=>{
    res.render('dashboardComplexe', {user: req.user})
})

app.get('/users/dashboardAdmin', (req,res)=>{
    res.render('dashboardAdmin', {user: req.user})
})

app.get('/users/profil', (req,res)=>{
    res.render('profil.ejs', {user: req.user})
})

app.get('/users/modifProfil', (req,res)=>{
    res.render('modifProfil.ejs', {user: req.user})
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