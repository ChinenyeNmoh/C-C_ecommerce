const Product = require('../models/product')
const Enquiry = require('../models/enquiry')

const createEnquiry = async(req, res) => {
  try{
    const newEnquiry = await Enquiry.create(req.body);
    req.flash('success', 'Enquiry created')
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }catch(err){
    console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
}
}

const updateEnquiry = async(req, res) => {
  const id = req.params.id;
  try{
    const findEnquiry = await Enquiry.findById(id);
    if(!findEnquiry){
      req.flash('error', 'Enquiry not found')
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
    }
    findEnquiry.status = "resolved";
    await findEnquiry.save()
    req.flash('success', 'Enquiry Updated')
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
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
        req.flash('error', 'Enquiry Not Found')
        const previousUrl = req.headers.referer || '/';
        return res.redirect(previousUrl);
      } else {
        await Enquiry.findByIdAndDelete(id);
  
        req.flash('success', 'Enquiry Deleted')
        const previousUrl = req.headers.referer || '/';
        return res.redirect(previousUrl);
      }
    } catch (err) {
      console.log(err)
      req.flash('error', err.message);
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
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
        req.flash('error', "No Enquiry found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
      } else {
        let admin = false;
        if (req.user && req.user.role === 'admin') {
          admin = true;
        } 
        const counter = all.length;
        res.render('admin/all_enquires', {layout: "main", 
        title: 'Enquires', 
        all,
        counter,
        isAuthenticated: req.user,
        admin,
      })
    }
    } catch (err) {
      console.log(err)
      req.flash('error', err.message);
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }
  };

  module.exports = {
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    getEnquiry,
    getAllEnquiry,
  };
  