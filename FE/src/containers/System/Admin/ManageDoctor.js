import React, { Component } from "react"
import styles from "./ManageDoctor.module.scss"
import { Button, Col, Container, Form, Row } from "react-bootstrap"
import * as actions from "../../../store/actions/adminAction"
import { connect } from "react-redux"
import Select from "react-select"
import { LANGUAGES } from "../../../utils"
import { CRUD_ACTIONS } from "../../../utils/constant"

import MarkdownIt from "markdown-it"
import MdEditor from "react-markdown-editor-lite"
import "react-markdown-editor-lite/lib/index.css"
import clsx from "clsx"
import { userService } from "../../../services"
import { FormattedMessage } from "react-intl"
const mdParser = new MarkdownIt(/* Markdown-it options */)

class ManageDoctor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //save to Markdown table
      contentMarkdown: "",
      contentHTML: "",
      selectedOption: "",
      description: "",
      listDoctors: [],
      hasOldData: false,

      //save to doctor_infor table
      listPrice: [],
      listPayment: [],
      listProvince: [],
      listClinic: [],
      listSpecialty: [],
      selectedPrice: "",
      selectedPayment: "",
      selectedProvince: "",
      selectedClinic: "",
      selectedSpecialty: "",
      nameClinic: "",
      addressClinic: "",
      note: "",
    }
  }

  componentDidMount() {
    this.props.fetchAllDoctors()
    this.props.getAllRequiredDoctorInfor()
  }

  buildDataInputSelect = (inputData, type) => {
    let result = []
    const { language } = this.props
    if (inputData && inputData.length > 0) {
      if (type === "USERS") {
        inputData.map((item, index) => {
          let object = {}
          let labelVi = `${item.lastName} ${item.firstName}`
          let labelEn = `${item.firstName} ${item.lastName}`
          object.label = language === LANGUAGES.VI ? labelVi : labelEn
          object.value = item.id
          result.push(object)
        })
      }
      if (type === "PRICE") {
        inputData.map((item, index) => {
          let object = {}
          let labelVi = `${item.valueVi}`
          let labelEn = `${item.valueEn} USD`
          object.label = language === LANGUAGES.VI ? labelVi : labelEn
          object.value = item.keyMap
          result.push(object)
        })
      }
      if (type === "PAYMENT" || type === "PROVINCE") {
        inputData.map((item, index) => {
          let object = {}
          let labelVi = `${item.valueVi}`
          let labelEn = `${item.valueEn}`
          object.label = language === LANGUAGES.VI ? labelVi : labelEn
          object.value = item.keyMap
          result.push(object)
        })
      }
      if (type === "SPECIALTY") {
        inputData.map((item, index) => {
          let object = {}
          object.label = item.name
          object.value = item.id
          result.push(object)
        })
      }
    }
    return result
  }

  componentDidUpdate = (preProps) => {
    if (preProps.allDoctors !== this.props.allDoctors) {
      let dataSelect = this.buildDataInputSelect(this.props.allDoctors, "USERS")
      this.setState({
        listDoctors: dataSelect,
      })
    }
    if (preProps.allRequiredDoctorInfor !== this.props.allRequiredDoctorInfor) {
      const { resPayment, resPrice, resProvince, resSpecialty } =
        this.props.allRequiredDoctorInfor

      let dataSelectPrice = this.buildDataInputSelect(resPrice, "PRICE")
      let dataSelectPayment = this.buildDataInputSelect(resPayment, "PAYMENT")
      let dataSelectProvince = this.buildDataInputSelect(
        resProvince,
        "PROVINCE"
      )
      let dataSelectSpecialty = this.buildDataInputSelect(
        resSpecialty,
        "SPECIALTY"
      )

      this.setState({
        listPrice: dataSelectPrice,
        listPayment: dataSelectPayment,
        listProvince: dataSelectProvince,
        listSpecialty: dataSelectSpecialty,
      })
    }
    if (preProps.language !== this.props.language) {
      const { resPayment, resPrice, resProvince } =
        this.props.allRequiredDoctorInfor
      let dataSelect = this.buildDataInputSelect(this.props.allDoctors, "USERS")
      let dataSelectPrice = this.buildDataInputSelect(resPrice, "PRICE")
      let dataSelectPayment = this.buildDataInputSelect(resPayment, "PAYMENT")
      let dataSelectProvince = this.buildDataInputSelect(
        resProvince,
        "PROVINCE"
      )

      this.setState({
        listDoctors: dataSelect,
        listPrice: dataSelectPrice,
        listPayment: dataSelectPayment,
        listProvince: dataSelectProvince,
      })
    }
  }

  handleEditorChange = ({ html, text }) => {
    this.setState({
      contentHTML: html,
      contentMarkdown: text,
    })
  }

  handleChangeSelect = async (selectedOption) => {
    this.setState({ selectedOption: selectedOption })
    const { listPayment, listPrice, listProvince, listSpecialty } = this.state

    let res = await userService.getDetailInforDoctor(selectedOption.value)

    if (res && res.errCode === 0 && res.data.Markdown) {
      let markdown = res.data.Markdown

      let addressClinic = "",
        nameClinic = "",
        note = "",
        paymentId = "",
        priceId = "",
        provinceId = "",
        specialtyId = "",
        selectedPayment = "",
        selectedPrice = "",
        selectedProvince = "",
        selectedSpecialty = ""
      if (res.data.Doctor_Infor) {
        addressClinic = res.data.Doctor_Infor.addressClinic
        nameClinic = res.data.Doctor_Infor.nameClinic
        note = res.data.Doctor_Infor.note
        paymentId = res.data.Doctor_Infor.paymentId
        priceId = res.data.Doctor_Infor.priceId
        provinceId = res.data.Doctor_Infor.provinceId
        specialtyId = res.data.Doctor_Infor.specialtyId

        selectedPayment = listPayment.find((item) => {
          return item && item.value === paymentId
        })
        selectedPrice = listPrice.find((item) => {
          return item && item.value === priceId
        })
        selectedProvince = listProvince.find((item) => {
          return item && item.value === provinceId
        })
        selectedSpecialty = listSpecialty.find((item) => {
          return item && item.value === specialtyId
        })
      }

      this.setState({
        contentHTML: markdown.contentHTML,
        contentMarkdown: markdown.contentMarkdown,
        description: markdown.description,
        hasOldData: true,
        addressClinic: addressClinic,
        nameClinic: nameClinic,
        note: note,
        selectedPayment: selectedPayment,
        selectedPrice: selectedPrice,
        selectedProvince: selectedProvince,
        selectedSpecialty: selectedSpecialty,
      })
    } else {
      this.setState({
        contentHTML: "",
        contentMarkdown: "",
        description: "",
        hasOldData: false,
        addressClinic: "",
        nameClinic: "",
        note: "",
        selectedPayment: "",
        selectedPrice: "",
        selectedProvince: "",
        selectedSpecialty: "",
      })
    }
  }

  handleSaveContentMardown = () => {
    const { hasOldData } = this.state
    this.props.saveInforDoctor({
      contentHTML: this.state.contentHTML,
      contentMarkdown: this.state.contentMarkdown,
      description: this.state.description,
      doctorId: this.state.selectedOption.value,
      action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,

      selectedPrice: this.state.selectedPrice.value,
      selectedPayment: this.state.selectedPayment.value,
      selectedProvince: this.state.selectedProvince.value,
      nameClinic: this.state.nameClinic,
      addressClinic: this.state.addressClinic,
      note: this.state.note,
      clinicId:
        this.state.selectedClinic && this.state.selectedClinic.value
          ? this.state.selectedClinic.value
          : "",
      specialtyId: this.state.selectedSpecialty.value,
    })
  }

  handleChangeSelectDoctorInfor = async (selectedOption, name) => {
    let stateName = name.name
    let stateCopy = { ...this.state }
    stateCopy[stateName] = selectedOption
    this.setState({
      ...stateCopy,
    })
  }

  handleOnchangeText = (event, id) => {
    let stateCopy = { ...this.state }
    stateCopy[id] = event.target.value
    this.setState({
      ...stateCopy,
    })
  }

  render() {
    const { hasOldData } = this.state
    return (
      <Container>
        <header className="mb-3">
          <h2 className="text-center mt-3">
            <FormattedMessage id="admin.manage-doctor.title" />
          </h2>
          <div className={styles.headerContent}>
            <div className={styles.contentLeft}>
              <p className={styles.titleSection}>
                <FormattedMessage id="admin.manage-doctor.select-doctor" />
              </p>
              <Select
                value={this.state.selectedOption}
                onChange={this.handleChangeSelect}
                options={this.state.listDoctors}
                className={clsx(styles.selectDoctor)}
                placeholder={
                  <FormattedMessage id="admin.manage-doctor.select-doctor" />
                }
              />
            </div>

            <div className={styles.contentRight}>
              <p className={styles.titleSection}>
                <FormattedMessage id="admin.manage-doctor.intro" />
              </p>
              <textarea
                cols="30"
                rows="4"
                value={this.state.description}
                onChange={(event) =>
                  this.handleOnchangeText(event, "description")
                }
              ></textarea>
            </div>
          </div>
        </header>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.price" />
              </Form.Label>
              <Select
                value={this.state.selectedPrice}
                onChange={this.handleChangeSelectDoctorInfor}
                options={this.state.listPrice}
                className={clsx(styles.selectDoctor)}
                placeholder={
                  <FormattedMessage id="admin.manage-doctor.price" />
                }
                name="selectedPrice"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.payment" />
              </Form.Label>
              <Select
                value={this.state.selectedPayment}
                onChange={this.handleChangeSelectDoctorInfor}
                options={this.state.listPayment}
                className={clsx(styles.selectDoctor)}
                placeholder={
                  <FormattedMessage id="admin.manage-doctor.payment" />
                }
                name="selectedPayment"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.province" />
              </Form.Label>
              <Select
                value={this.state.selectedProvince}
                onChange={this.handleChangeSelectDoctorInfor}
                options={this.state.listProvince}
                className={clsx(styles.selectDoctor)}
                placeholder={
                  <FormattedMessage id="admin.manage-doctor.province" />
                }
                name="selectedProvince"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.nameClinic" />
              </Form.Label>
              <Form.Control
                onChange={(event) =>
                  this.handleOnchangeText(event, "nameClinic")
                }
                value={this.state.nameClinic}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.addressClinic" />
              </Form.Label>
              <Form.Control
                onChange={(event) =>
                  this.handleOnchangeText(event, "addressClinic")
                }
                value={this.state.addressClinic}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.note" />
              </Form.Label>
              <Form.Control
                onChange={(event) => this.handleOnchangeText(event, "note")}
                value={this.state.note}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.specialty" />
              </Form.Label>
              <Select
                value={this.state.selectedSpecialty}
                onChange={this.handleChangeSelectDoctorInfor}
                options={this.state.listSpecialty}
                className={clsx(styles.selectDoctor)}
                placeholder={
                  <FormattedMessage id="admin.manage-doctor.specialty" />
                }
                name="selectedSpecialty"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>
                <FormattedMessage id="admin.manage-doctor.clinic" />
              </Form.Label>
              <Select
                value={this.state.selectedClinic}
                onChange={this.handleChangeSelectDoctorInfor}
                options={this.state.listClinic}
                className={clsx(styles.selectDoctor)}
                placeholder={
                  <FormattedMessage id="admin.manage-doctor.clinic" />
                }
                name="selectedClinic"
              />
            </Form.Group>
          </Col>
        </Row>

        <main>
          <p className={styles.titleSection}>Thông tin chi tiết về bác sĩ</p>
          <MdEditor
            style={{ height: "300px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={this.handleEditorChange}
            value={this.state.contentMarkdown}
          />
        </main>
        <Button
          variant="primary"
          className="mt-3"
          onClick={this.handleSaveContentMardown}
        >
          {hasOldData === true ? (
            <FormattedMessage id="admin.manage-doctor.save" />
          ) : (
            <FormattedMessage id="admin.manage-doctor.add" />
          )}
        </Button>
      </Container>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    allDoctors: state.admin.allDoctors,
    language: state.app.language,
    allRequiredDoctorInfor: state.admin.allRequiredDoctorInfor,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    getAllRequiredDoctorInfor: () => dispatch(actions.getRequiredDoctorInfor()),
    saveInforDoctor: (data) => dispatch(actions.saveInforDoctor(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor)
