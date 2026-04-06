import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client'

function findUserByEmail(email) {
  const user = await prisma.user.findUnique

  return .user.findUnique({
    where: {
      email,
    },
  });
}

function createUserByEmailAndPassword(user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

module.exports = {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
};