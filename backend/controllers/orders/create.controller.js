const { prisma } = require("../../config/database");
const { recordUserPhoto } = require("../../utils/listing");

/**
 * Create Order
 * @route POST /api/orders
 */
exports.createOrder = async (req, res) => {
  try {
    const { title, wilaya, details, preparationDate, vaccinated, pricePerKg } =
      req.body;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const order = await prisma.order.create({
      data: {
        title,
        wilaya,
        details,
        preparationDate: preparationDate ? new Date(preparationDate) : null,
        vaccinated:
          typeof vaccinated === "boolean"
            ? vaccinated
            : String(vaccinated || "").toLowerCase() === "true",
        pricePerKg:
          pricePerKg === "" || pricePerKg === undefined
            ? null
            : Number(pricePerKg),
        photo: photoPath,
        userId: req.user.id,
      },
    });

    if (req.file) {
      try {
        await recordUserPhoto({
          userId: req.user.id,
          file: req.file,
          source: "listing",
          referenceId: order.id,
        });
      } catch (err) {
        if (err?.code === "PHOTO_LIMIT_REACHED") {
          return res.status(400).json({
            success: false,
            message:
              "You reached 20 saved photos. Please delete or clear uploads before adding more.",
          });
        }
        console.error("Photo record error:", err);
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Create failed" });
  }
};
