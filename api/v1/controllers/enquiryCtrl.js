const Product = require('../models/product')
const Enquiry = require('../models/enquiry')

const createEnquiry = async(req, res) => {
  try{
    const newEnquiry = await Enquiry.create(req.body);
    res.status(201).json({
        message: "Enquiry created successfully",
        data: newEnquiry});
  }catch(err){
    console.error(err);
    return res.status(500).json({
        message: err.message,
    });
}
}

const updateEnquiry = async(req, res) => {
  const id = req.params.id;
  try{
    const findEnquiry = await Enquiry.findById(id);
    if(!findEnquiry){
        return res.status(404).json({
            message: "Enquiry not found"
        })
    }
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
        id,
        req.body,
        {new: true}
        );
    return res.status(200).json({
        message: "Enquiry updated successfully",
        data: updatedEnquiry});
  }catch(err){
    console.error(err);
    return res.status(500).json({
        message: err.message,
    });
    }
}

// delete enquiry
const deleteEnquiry = async (req, res) => {
    const { id } = req.params;
  
    try {
      const findEnquiry = await Enquiry.findById(id);
  
      if (!findEnquiry) {
        return res.status(404).json({
          message: "Enquiry not found",
        });
      } else {
        await Enquiry.findByIdAndDelete(id);
  
        return res.status(200).json({
          message: "Enquiry deleted successfully",
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.message,
      });
    }
  };
  
  // get enquiry
  const getEnquiry = async (req, res) => {
    const { id } = req.params;
  
    try {
      const findEnquiry = await Enquiry.findById(id);
  
      if (!findEnquiry) {
        return res.status(404).json({
          message: "Enquiry not found",
        });
      } else {
        return res.status(200).json({
          message: "Success",
          data: findEnquiry,
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.message,
      });
    }
  };
  
  // get all enquiry
  const getAllEnquiry = async (req, res) => {
    try {
      const all = await Enquiry.find();
  
      if (!all || all.length === 0) {
        return res.status(404).json({
          message: "No Enquiry found",
        });
      } else {
        const counter = await Enquiry.countDocuments();
        return res.status(200).json({
          message: "Success",
          count: counter,
          data: all,
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.message
      });
    }
  };

  module.exports = {
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    getEnquiry,
    getAllEnquiry,
  };
  