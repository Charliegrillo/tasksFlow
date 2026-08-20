import { createClient } from "@libsql/client";
import fs from "fs";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  try {
    const sql = fs.readFileSync("C:\\PROJECT PERSONAL\\tasksFlow\\db-exported.sql", "utf8");
    await db.executeMultiple(sql);
    console.log("¡Base de datos importada con éxito en Turso!");
  } catch (error) {
    console.error("Error al importar la base de datos:", error);
  }
}

run();