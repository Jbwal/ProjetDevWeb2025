const { Client } = require('pg')

const con = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "admin",
  database: "projetDevWeb"
})

con.connect()

async function updateBatteryLevels() {
  try {
    const now = new Date()

    const result = await con.query(`SELECT * FROM public."Device"`)

    for (const device of result.rows) {
        let lastInteraction = device.lastInteraction 
        if (!lastInteraction) {
          lastInteraction = new Date(Date.now() - 10000)
        }
        
        const secondsPassed = (now - new Date(lastInteraction)) / 1000
        
      const hoursPassed = (now - new Date(lastInteraction)) / (1000)
      let battery = device.batteryLevel ?? (device.status === 'Actif' ? 100 : 0)

      if (device.status === 'Actif') {
        battery = Math.max(0, battery - hoursPassed * 0.00833)
      } else if (device.status === 'Inactif') {
        battery = Math.min(100, battery + hoursPassed * 0.01666)
      }

      await con.query(`
        UPDATE public."Device"
        SET "batteryLevel" = $1, "lastInteraction" = $2
        WHERE id = $3
      `, [battery, now, device.id])
    }

    console.log(`[${now.toISOString()}] Batterie mise à jour.`)
  } catch (err) {
    console.error("Erreur dans updateBatteryLevels :", err)
  }
}

async function updateBatteryLevelsThermos() {
    try {
      const now = new Date()
  
      const result = await con.query(`SELECT * FROM public."Thermostats"`)
  
      for (const device of result.rows) {
          let lastInteraction = device.lastInteraction 
          if (!lastInteraction) {
            lastInteraction = new Date(Date.now() - 10000)
          }
          
          const secondsPassed = (now - new Date(lastInteraction)) / 1000
          
        const hoursPassed = (now - new Date(lastInteraction)) / (1000)
        let battery = device.batteryLevel ?? (device.status === 'Actif' ? 100 : 0)
  
        if (device.status === 'Actif') {
          battery = Math.max(0, battery - hoursPassed * 0.00833)
        } else if (device.status === 'Inactif') {
          battery = Math.min(100, battery + hoursPassed * 0.01666)
        }
  
        await con.query(`
          UPDATE public."Thermostats"
          SET "batteryLevel" = $1, "lastInteraction" = $2
          WHERE id = $3
        `, [battery, now, device.id])
      }
  
      console.log(`[${now.toISOString()}] Batterie des Thermos mise à jour.`)
    } catch (err) {
      console.error("Erreur dans updateBatteryLevels :", err)
    }
  }

module.exports = { updateBatteryLevels, updateBatteryLevelsThermos }