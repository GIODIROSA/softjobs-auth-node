const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

const {
  getUsuario,
  registroUsuario,
  verificarCredenciales,
} = require("./consulta");

const PORT = 3001;

app.use(express.json());
app.use(cors());

const reportarConsulta = async (req, res, next) => {
  const url = req.url;

  console.log(
    `
    Hoy ${new Date()}
    Se ha recibido una consulta en la ruta ${url}
    `
  );
  next();
};

app.get("/usuarios", async (req, res) => {
  try {
    const token = req.headers.authorization;

    const readToken = token.split("Bearer ")[1];
    console.log("ESTE ES EL TOKEN:", readToken);

    jwt.verify(readToken, "az_AZ");
    const { email } = jwt.decode(readToken);
    const emailEncontrado = await getUsuario(email, res);

    if (emailEncontrado) {
      res.status(200).json({ email: emailEncontrado });
    } else {
      res.status(404).json({ message: "Email no encontrado" });
    }
  } catch (error) {
    console.error("ERROR en la ruta /usuarios: ", error);
    res.status(error.code || 500).send(error);
  }
});

app.post("/usuarios", reportarConsulta, async (req, res) => {
  try {
    const usuario = req.body;
    await registroUsuario(usuario);
    res.send("Usuario creado con éxito");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    await verificarCredenciales(email, password);
    const token = jwt.sign({ email }, "az_AZ", {expiresIn: "10h"});
    // res.json({ success: true, email, token });
    res.send(token);
  } catch (error) {
    console.log(error);
    res.status(error || 500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`SERVIDOR ENCENDIDO EN EL PORT: ${PORT}`);
});
