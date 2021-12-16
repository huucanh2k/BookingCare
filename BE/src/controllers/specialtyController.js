import specialtyService from "../services/specialtyService"

const createSpecialty = async (req, res) => {
  try {
    let infor = await specialtyService.createSpecialty(req.body)
    return res.status(200).json(infor)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    })
  }
}

const getAllSpecialty = async (req, res) => {
  try {
    let infor = await specialtyService.getAllSpecialty()
    return res.status(200).json(infor)
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    })
  }
}

module.exports = {
  createSpecialty,
  getAllSpecialty,
}
