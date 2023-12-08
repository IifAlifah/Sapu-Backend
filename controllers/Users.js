import argon2 from 'argon2';
import Users from '../models/UserModel.js';
import { Op } from 'sequelize';

export const getUsers = async (req, res) => {
  try {
    let queryOptions = {
      attributes: ['id', 'uuid', 'name', 'email', 'username', 'role', 'balance'],
    };

    const searchQuery = req.query.search;

    if (searchQuery) {
      queryOptions.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { username: { [Op.like]: `%${searchQuery}%` } },
          { email: { [Op.like]: `%${searchQuery}%` } },
        ],
      };
    }

    const users = await Users.findAll(queryOptions);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Terjadi kesalahan server' });
  }
};


export const getUserById = async (req, res) => {
  try {
    const users = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!users) {
        return res.status(404).json({ msg: "User tidak ditemukan" });
    }
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Terjadi kesalahan server' });
  }
};

export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, username, email, role } = req.body;

    try {
        const isEmailTaken = await Users.findOne({
            where: {
                email: email,
                id: { [Op.not]: userId }
            }
        });

        if (isEmailTaken) {
            return res.status(400).json({ msg: "Email sudah digunakan" });
        }

        const existingUser = await Users.findByPk(userId);

        if (!existingUser) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        existingUser.name = name;
        existingUser.username = username;
        existingUser.email = email;
        existingUser.role = role;

        await existingUser.save();

        res.status(200).json({ msg: "User berhasil diupdate" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};

export const deleteUser = async (req, res) => {
  const user = await Users.findOne({
    where: {
      id: req.params.id,
    },
  });
  
  if (!user) {
    return res.status(404).json({ msg: 'User tidak ditemukan' });
  }
  
  await Users.destroy({
    where: {
      id: req.params.id,
    },
  });
  
  res.status(200).json({ msg: 'User berhasil dihapus' });
  
};

export const Register = async (req, res) => {
  const {
    name, username, email, password, confPassword,
  } = req.body;

  const role = "user";

  if (!name || !username || !email || !password || !confPassword || !role) return res.status(400).json({ msg: 'Mohon untuk mengisi semua kolom form.' });

  if (password !== confPassword) {
    return res.status(400).json({ msg: 'Password dan Confirm Password tidak cocok' });
  }

  try {
    const existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ msg: 'Email sudah terdaftar' });
    }

    const hashPassword = await argon2.hash(password);

    await Users.create({
      name,
      username,
      email,
      password: hashPassword,
      role,
    });

    res.json({ msg: 'Register Berhasil' });
  } catch (error) {
    console.log(error);
  }
};
