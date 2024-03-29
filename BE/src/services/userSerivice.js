import bcrypt from "bcryptjs"
import { raw } from "body-parser"
import db from "../models/index"
import jwt from 'jsonwebtoken'

const salt = bcrypt.genSaltSync(10) //công thức hash

const hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashPassword = await bcrypt.hashSync(password, salt)
      resolve(hashPassword)
    } catch (e) {
      reject(e)
    }
  })
}

const handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userResult = await findUserByEmail(email)
      const output = {
        data: {},
      }

      if (userResult) {
        const checkPassword = await bcrypt.compareSync(
          password,
          userResult.password
        )
        if (checkPassword) {
          output.errCode = 0
          output.errMessage = "OK"
          output.data = {
            email: userResult.email,
            roleId: userResult.roleId,
            firstName: userResult.firstName,
            lastName: userResult.lastName,
            id: userResult.id,
          }
        } else {
          output.errCode = 2
          output.errMessage = "Wrong password"
        }
      } else {
        output.errCode = 3
        output.errMessage = `You's email isn't exist in your system. Please try other email!`
      }
      const access_token = jwt.sign({...output.data}, process.env.SECRET, {expiresIn: 60 * 60})
      console.log({access_token})
      output.access_token = access_token
      console.log({output})
      resolve(output)
    } catch (e) {
      reject(e)
    }
  })
}

const checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findOne({
        where: { email: userEmail },
      })
      if (user) {
        resolve(true)
      } else {
        resolve(false)
      }
    } catch (e) {
      reject(e)
    }
  })
}
const findUserByEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findOne({
        where: { email: userEmail },
        raw: true,
      })
      if (user) {
        resolve(user)
      } else {
        resolve(false)
      }
    } catch (e) {
      reject(e)
    }
  })
}

const getAllUsers = (userID) => {
  return new Promise(async (resole, reject) => {
    try {
      let users = ""
      if (userID === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
        })
      }
      if (userID && userID !== "ALL") {
        users = await db.User.findOne({
          where: { id: userID },
          attributes: {
            exclude: ["password"],
          },
        })
      }
      resole(users)
    } catch (e) {
      reject(e)
    }
  })
}

const createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkUserEmail(data.email)
      if (check) {
        resolve({
          errCode: 1,
          message: "Your email is already in used. Please try another email!",
        })
        return
      }

      const hashPasswordFromBcrypt = await hashUserPassword(data.password)
      console.log({hashPasswordFromBcrypt})
      await db.User.create({
        email: data.email,
        password: hashPasswordFromBcrypt,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phonenumber: data.phoneNumber,
        gender: data.gender,
        roleId: data.role,
        positionId: data.position,
        image: data.avatar,
      })

      const user = await findUserByEmail(data.email)

      resolve({
        errCode: 0,
        message: "OK",
        data: {
          user,
        },
      })
    } catch (e) {
      reject(e)
    }
  })
}
const deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: userId },
      })
      if (!user) {
        resolve({
          errCode: 2,
          errMessage: `The user isn't exist`,
        })
      }
      const userRes = await findUserByEmail(user.email)
      delete userRes.password
      await user.destroy()

      resolve({
        errCode: 0,
        errMessage: "The user is deleted",
        user: userRes,
      })
    } catch (e) {
      reject(e)
    }
  })
}

const updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 2,
          errMessage: "Missing requied parameters",
        })
      }
      let user = await db.User.findOne({
        where: { id: data.id },
      })

      if (user) {
        user.firstName = data.firstName
        user.lastName = data.lastName
        user.address = data.address
        user.phonenumber = data.phoneNumber
        user.gender = data.gender
        user.roleId = data.role
        user.positionId = data.position
        if (data.avatar) {
          user.image = data.avatar
        }
        await user.save()
        const userEdit = await findUserByEmail(data.email)
        resolve({
          errCode: 0,
          message: "Update user succeed",
          data: {
            user: userEdit,
          },
        })
      } else {
        resolve({
          errCode: 1,
          message: "User not found!",
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

const getAllCodeService = async (typeAllCode) => {
  return new Promise(async (resole, reject) => {
    try {
      if (!typeAllCode) {
        resole({
          errCode: 1,
          errMessage: "Missing required parameters !",
        })
      } else {
        let res = {}
        let data = await db.Allcode.findAll({
          where: { type: typeAllCode },
        })
        res.errCode = 0
        res.data = data
        resole(res)
      }
    } catch (e) {
      reject(e)
    }
  })
}

const sendRemedy = (data) => {}

const userService = {
  handleUserLogin,
  checkUserEmail,
  getAllUsers,
  createNewUser,
  deleteUser,
  updateUserData,
  getAllCodeService,
  sendRemedy,
}

export default userService
