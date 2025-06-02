const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


const app = express();
app.use(cors());

app.use(express.json()); // Ceci est indispensable

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crud"
});

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à MySQL :", err);
    return;
  }
  console.log("Connecté à MySQL !");
});
//ajouter un nouvelle utulisateur
app.post('/Creer', (req, res) => {
  const { Name, email } = req.body;

  // Étape 1 : Vérifier si l'utilisateur existe déjà (même nom OU même email)
  const checkSql = "SELECT * FROM users WHERE Name = ? OR email = ?";
  db.query(checkSql, [Name, email], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la vérification" });

    if (result.length > 0) {
      // Si un utilisateur existe déjà
      return res.status(409).json({ error: "Cet utilisateur existe déjà." });
    }

    // Étape 2 : Si non existant, on l'insère
    const insertSql = "INSERT INTO users (`Name`,`email`) VALUES (?)";
    const values = [Name, email];

    db.query(insertSql, [values], (err, data) => {
      if (err) return res.status(500).json({ error: "Erreur lors de l'insertion" });
      return res.status(201).json({ message: "Utilisateur ajouté avec succès", data });
    });
  });
});


//afficher un utilisateur  
app.get("/", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: err.message });
    }

    return res.json(data);
  });
});
// pour remplir les champs avant la modifications 
app.get('/user/:id', (req, res) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur SQL" });
    if (result.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });
    return res.json(result[0]); // renvoie l'utilisateur unique
  });
});

// Modifier un utulisateur
app.put('/update/:id',(req, res)=>{
  const sql= "update  users set `Name` = ?, `email` = ? where ID = ?";
  const values= [
    req.body.Name,
    req.body.email
  ]
  const id=req.params.id;

db.query(sql, [...values, id],(err, data)=> {
  if(err)return res.json("Error");
  return res.json(data);
})
})

//pour effacer le clients 
app.delete('/userdel/:id', (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la suppression" });
    return res.json({ message: "Utilisateur supprimé avec succès" });
  });
});


app.listen(8081, () => {
  console.log("Serveur en écoute sur le port 8081");
});
