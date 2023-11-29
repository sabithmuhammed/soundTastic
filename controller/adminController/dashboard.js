
const loadDashboard = async (req, res) => {
    try {
      const name = req.session.admin;
      res.render("admin/dashboard");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  module.exports={
    loadDashboard,
  }