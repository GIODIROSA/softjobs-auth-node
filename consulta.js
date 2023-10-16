const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

//softjobs

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "root",
  database: "softjobs",
  allowExitOnIdle: true,
});

const getUsuario = async (email, res) => {
  try {
    let consulta = "SELECT email, rol, lenguage FROM usuarios WHERE email = $1";
    let values = [email];
    const { rows } = await pool.query(consulta, values);

    if (rows.length > 0) {
      return rows[0].email;
    } else {
      return null;
    }
  } catch (error) {
    console.error("ERROR en la query: ", error);
    throw error;
  }
};

const registroUsuario = async (usuario) => {
  try {
    let { email, password, rol, lenguage } = usuario;
    const passwordEncriptado = bcrypt.hashSync(password);
    password = passwordEncriptado;
    const values = [email, passwordEncriptado, rol, lenguage];
    const consulta =
      "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)";
    const { rowCount } = await pool.query(consulta, values);
    return rowCount;
  } catch (error) {
    console.error("ERROR en la query: ", error);
    res.status(500).json({ error: "Error al actualizar el evento" });
  }
};

const verificarCredenciales = async (email, password) => {
  const values = [email];
  const consulta = "SELECT * FROM usuarios WHERE email = $1";

  const { rows, rowCount } = await pool.query(consulta, values);

  if (rowCount === 1) {
    const usuario = rows[0];
    const passwordEncriptado = usuario.password;
    const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptado);
    if (!passwordEsCorrecta) {
      throw {
        code: 404,
        message: "No se encontró ningún usuario con estas credenciales",
      };
    }
  }
};

module.exports = { getUsuario, registroUsuario, verificarCredenciales };
