const localStrategy = require('passport-local').Strategy
const { con } = require('./dbConfig')
const bcrypt = require('bcrypt')

function initialized(passport){
    const authenticateUser = (email,password,done)=>{


        con.query(
            `SELECT * FROM public."UserHotel" WHERE email = $1`,[email],(err,result)=>{
                if(err) return done(err)


                if(result.rows.length > 0){
                    const user = result.rows[0]

                    if (!user.is_verified) {
                        return done(null, false, { message: "Veuillez vérifier votre email avant de vous connecter." });
                    }
                
                    bcrypt.compare(password, user.password, (err,isMatch) =>{
                        if(err) return result.send(err)

                        if(isMatch){
                            return done(null,user)
                        }else{
                            return done(null,false,{message: "Le mot de passe est incorrect"})
                        }
                        
                    })
                }else{
                    return done(null,false, {message: "L'email ne correspond a aucun compte"})
                }
            }

        )
    }

    passport.use(
        new localStrategy({
            usernameField: "email",
            passwordField: "password"
        },
        authenticateUser
    )
    )

    passport.serializeUser((user, done) => done(null,user.id))

    passport.deserializeUser((id,done)=>{
        con.query(
            `SELECT * FROM public."UserHotel" WHERE id = $1`, [id], (err, result)=>{
                if(err) return result.send(err)

                return done(null,result.rows[0])
            }
        )
    })
}

module.exports = initialized