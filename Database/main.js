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
    if(req.user.userType == 'admin'){
        const sortField = req.query.sort || 'id'
        const sortOrder = req.query.order || 'asc'

        const allowedFields = ['id', 'pointsTotal']
        const allowedOrders = ['asc', 'desc']

        if (!allowedFields.includes(sortField) || !allowedOrders.includes(sortOrder)) { // pour éviter injections sql
            return res.status(400).send('Paramètres de tri invalides.');
        }

        const fetch_query = `SELECT * FROM public."UserHotel" ORDER BY "${sortField}" ${sortOrder}`
        con.query(fetch_query,(err,result)=>{
            if(err)
                {
                    res.send(err)
                }else{
                    res.render('listeUtilisateursAdmin', { users: result.rows })
                }
        })
    }
    else{
        const sortField = req.query.sort || 'id'
        const sortOrder = req.query.order || 'asc'

        const allowedFields = ['id', 'pointsTotal']
        const allowedOrders = ['asc', 'desc']

        if (!allowedFields.includes(sortField) || !allowedOrders.includes(sortOrder)) { // pour éviter injections sql
            return res.status(400).send('Paramètres de tri invalides.');
        }

        const fetch_query = `SELECT * FROM public."UserHotel" ORDER BY "${sortField}" ${sortOrder}`
        con.query(fetch_query,(err,result)=>{
            if(err)
                {
                    res.send(err)
                }else{
                    res.render('listeUtilisateursSimple', { users: result.rows })
                }
        })
    }
})

app.get('/users/listeObjets', (req, res) => {
    // Vérification du type d'utilisateur
    // Récupération du terme de recherche
    const recherche = req.query.search || '';

    // Requête SQL pour les administrateurs (peut avoir des informations supplémentaires)
    let fetch_query = `SELECT * FROM public."Device"`
    const params =[]

    // Ajout de la condition de recherche si un terme est fourni
    if (recherche) {
        fetch_query += ` WHERE name LIKE $1 OR "deviceType" LIKE $1 OR brand LIKE $1 OR status LIKE $1`
        params.push(`%${recherche}%`)
    }

    con.query(fetch_query, params, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            // Rendu de la page avec les données des appareils et l'utilisateur courant
            res.render('listeObjets', { 
                devices: result.rows,
                user: req.user,
                recherche: recherche //renvoie le terme de recherche
            })
        }
    })
})

app.get('/users/listeTermos', (req, res) => {
    // Vérification du type d'utilisateur
    // Récupération du terme de recherche
    const recherche = req.query.search || '';

    // Requête SQL pour les administrateurs (peut avoir des informations supplémentaires)
    let fetch_query = `SELECT * FROM public."Thermostats"`
    const params =[]

    // Ajout de la condition de recherche si un terme est fourni
    if (recherche) {
        fetch_query += ` WHERE name LIKE $1 OR brand LIKE $1 OR status LIKE $1`
        params.push(`%${recherche}%`)
    }

    con.query(fetch_query, params, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            // Rendu de la page avec les données des appareils et l'utilisateur courant
            res.render('listeTermos', { 
                devices: result.rows,
                user: req.user,
                recherche: recherche //renvoie le terme de recherche
            })
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

app.post('/updatePoints/:id', (req, res) => {
    const id = req.params.id
    const newPoints = parseFloat(req.body.points)

    con.query(
        `UPDATE public."UserHotel" SET "pointsTotal" = $1 WHERE id = $2`,
        [newPoints, id],
        (err) => {
            if (err) return res.status(500).send("Erreur mise à jour des points.")

            let newType = 'simple'
            if (newPoints >= 5000) {
                newType = 'admin'
            } else if (newPoints >= 1000) {
                newType = 'complexe'
            }

            con.query(
                `UPDATE public."UserHotel" SET "userType" = $1 WHERE id = $2`,
                [newType, id],
                (err2) => {
                    if (err2) return res.status(500).send("Erreur mise à jour du rôle.")

                    res.status(200).send("Points et rôle mis à jour !")
                }
            )
        }
    )
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
    res.render('index', { user: req.user} )
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

app.get('/users/dashboardSimple', async (req,res)=>{
    try {
        const totalResult = await con.query('SELECT COUNT(*) FROM public."UserHotel"')
        const activeResult = await con.query(`
            SELECT COUNT(*) FROM public."UserHotel" 
            WHERE last_login >= NOW() - INTERVAL '7 days'
        `)
        const totalObject1 = await con.query(`SELECT COUNT(*) FROM public."Device"`)
        const totalObject2 = await con.query(`SELECT COUNT(*) FROM public."Thermostats"`)

        const totalUsers = parseInt(totalResult.rows[0].count, 10)
        const activeUsers = parseInt(activeResult.rows[0].count, 10)
        const totalDevices = parseInt(totalObject1.rows[0].count, 10)
        const totalThermos = parseInt(totalObject2.rows[0].count, 10)
        const totalObjects = totalDevices + totalThermos
        
        res.render('dashboardSimple', { totalUsers, activeUsers, totalObjects, user: req.user })
    } catch (err) {
        console.error(err)
        res.render('dashboardSimple', { totalUsers: 'Erreur', activeUsers: 'Erreur' , totalObjects: 'Erreur' , user : req.user})
    }
})


app.get('/users/dashboardComplexe', async (req,res)=>{
    try {
        const totalResult = await con.query('SELECT COUNT(*) FROM public."UserHotel"')
        const activeResult = await con.query(`
            SELECT COUNT(*) FROM public."UserHotel" 
            WHERE last_login >= NOW() - INTERVAL '7 days'
        `)
        const totalObject1 = await con.query(`SELECT COUNT(*) FROM public."Device"`)
        const totalObject2 = await con.query(`SELECT COUNT(*) FROM public."Thermostats"`)

        const totalUsers = parseInt(totalResult.rows[0].count, 10)
        const activeUsers = parseInt(activeResult.rows[0].count, 10)
        const totalDevices = parseInt(totalObject1.rows[0].count, 10)
        const totalThermos = parseInt(totalObject2.rows[0].count, 10)
        const totalObjects = totalDevices + totalThermos
        
        res.render('dashboardComplexe', { totalUsers, activeUsers, totalObjects, user: req.user })
    } catch (err) {
        console.error(err)
        res.render('dashboardComplexe', { totalUsers: 'Erreur', activeUsers: 'Erreur' , totalObjects: 'Erreur' , user : req.user})
    }
})

app.get('/users/dashboardAdmin', async (req,res)=>{
    try {
        const totalResult = await con.query('SELECT COUNT(*) FROM public."UserHotel"')
        const activeResult = await con.query(`
            SELECT COUNT(*) FROM public."UserHotel" 
            WHERE last_login >= NOW() - INTERVAL '7 days'
        `)
        const totalObject1 = await con.query(`SELECT COUNT(*) FROM public."Device"`)
        const totalObject2 = await con.query(`SELECT COUNT(*) FROM public."Thermostats"`)

        const totalUsers = parseInt(totalResult.rows[0].count, 10)
        const activeUsers = parseInt(activeResult.rows[0].count, 10)
        const totalDevices = parseInt(totalObject1.rows[0].count, 10)
        const totalThermos = parseInt(totalObject2.rows[0].count, 10)
        const totalObjects = totalDevices + totalThermos

        res.render('dashboardAdmin', { totalUsers, activeUsers, totalObjects, user: req.user })
    } catch (err) {
        console.error(err)
        res.render('dashboardAdmin', { totalUsers: 'Erreur', activeUsers: 'Erreur' , totalObjects: 'Erreur' , user : req.user})
    }
})


app.get('/users/profil', (req,res)=>{
    res.render('profil.ejs', {user: req.user})
})

app.get('/users/modifProfil', (req,res)=>{
    res.render('modifProfil.ejs', {user: req.user})
})

app.get('/users/actualites', (req,res)=>{
    res.render('actualites.ejs', {user: req.user})
})

app.get('/users/formForum', (req,res)=>{
    res.render('formForum.ejs', {user: req.user})
})

app.get("/users/forum", async (req,res)=>{
    try{
        const { rows } = await con.query(`SELECT * FROM public."forum" ORDER BY dateCreation DESC`)
        res.render('forum.ejs', {posts : rows , user : req.user})
    } catch(err) {
        console.log(err)
        res.send("Erreur lors du chargement du forum")
    }
})

app.post('/users/formForum', async (req,res)=>{
    const login = req.user?.login
    const {titre, texte} = req.body

    if(!login)
        return res.status(401).send("Utilisateur non connecté.")

    try{
        await con.query(
            'INSERT INTO public."forum" (login, titre, texte) VALUES ($1, $2, $3)',
            [login, titre, texte]
        )
        req.flash('success_msg', 'Post ajouté avec succès !')
        res.redirect('/users/forum')
    }catch(err){
        console.error(err);
        req.flash('error_msg', 'Erreur lors de l’ajout du post.')
        res.redirect('/users/formForum')
    }
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