const { prisma } = require("../../../config/database");

exports.deleteListing = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  
  const listing = await prisma.order.findUnique({ where: { id } });
  if (!listing) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  
  await prisma.order.delete({ where: { id } });
  res.json({ success: true, message: "Deleted" });
};
