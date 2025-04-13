const { Client } = require('pg')

const con = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "admin",
  database: "projetDevWeb"
})

con.connect()

async function updateThermostats() {
  try {
    const { rows } = await con.query(`SELECT * FROM public."Thermostats"`)

    for (const thermo of rows) {
      const goal = isNaN(parseFloat(thermo.goalTemp)) ? 20 : parseFloat(thermo.goalTemp)
      let current = isNaN(parseFloat(thermo.currentTemp)) ? 20 : parseFloat(thermo.currentTemp)

      const diff = goal - current

      // 1. Si proche de goal légère oscillation
      if (Math.abs(diff) <= 0.3) {
        const variation = (Math.random() * 0.1) - 0.05 // entre -0.05 et +0.05
        current += variation
      } 

      else {
        const step = 0.2 
        current += Math.sign(diff) * Math.min(step, Math.abs(diff))
      }

      current = Math.round(current * 100) / 100

      await con.query(`
        UPDATE public."Thermostats"
        SET "currentTemp" = $1
        WHERE id = $2
      `, [current, thermo.id])
    }

    console.log(`[${new Date().toISOString()}] Mise à jour des thermostats OK`)
  } catch (err) {
    console.error("Erreur updateThermostats :", err)
  }
}

module.exports = { updateThermostats }
