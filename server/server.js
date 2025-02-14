const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

app.use(cors());
app.use(express.json()); // читать JSON-запросы

// Подключаем SQLite
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite");
});

// Создаём таблицу (если нет)
db.run(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    percentage REAL DEFAULT 1
  )
`);

// получения записей
app.get("/api/records", (req, res) => {
  db.all("SELECT * FROM records ORDER BY created_at DESC", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// добавления записи
app.post("/api/records", (req, res) => {
  const newId = Math.floor(1000000000 + Math.random() * 9000000000); //  id
  db.run("INSERT INTO records (id) VALUES (?)", [newId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    db.get("SELECT * FROM records WHERE id = ?", [newId], (err, row) => {
      if (!err) {
        io.emit("new_record", row); // Отправляем новую запись клиентам
        res.json(row);
      }
    });
  });
});

server.listen(5000, () => console.log("Server running on http://localhost:5000"));
