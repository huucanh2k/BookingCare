import bcrypt from "bcryptjs"
import db from "../models/index"


const handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        // try {
        //     let userData = {};
        //     let isExist = await checkUserEmail(email);
        //     if (isExist) {
        //         let user = await db.User.findOne({
        //             attributes: ['email', 'roleid', 'password'],
        //             where: { email: email },
        //             raw: true
        //         })

        //         if (user) {
        //             const check = await bcrypt.compareSync(password, user.password)
        //             if (check) {
        //                 userData.errCode = 0
        //                 userData.errMessage = 'Ok'
        //                 delete user.password
        //                 userData.userData = user;
        //             } else {
        //                 userData.errCode = 2
        //                 userData.errMessage = `Wrong password `
        //             }
        //         } else {
        //             userData.errCode = 2
        //             userData.errMessage = `User's not found `
        //         }

        //         resolve(userData)
        //     } else {
        //         console.log('email sai')
        //         userData.errCode = 1
        //         userData.errMessage = `You's Email isn't exist in your system. Please try other email!`
        //     }
        //     resolve(userData)

        // } catch (e) {
        //     reject(e)
        // }

        try {
            const userResult = await findUserByEmail(email)
            const output = {
                data: {}
            }

            if (userResult) {
                const checkPassword = await bcrypt.compareSync(password, userResult.password)
                if (checkPassword) {
                    output.errCode = 0
                    output.errMessage = 'OK'
                    output.data = {
                        email: userResult.email,
                        roleId: userResult.roleId
                    }
                } else {
                    output.errCode = 2
                    output.errMessage = 'Wrong password'
                }
            } else {
                output.errCode = 3
                output.errMessage = `You's email isn't exist in your system. Please try other email!`
            }

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
                where: { email: userEmail }
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
                raw: true
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

const userService = {
    handleUserLogin,
    checkUserEmail
}

export default userService