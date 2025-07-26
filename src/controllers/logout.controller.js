const logoutController = async (req, res) => {
  res.status(200).json({ success: true, message: "Operación realizada correctamente" });
};

export { logoutController };