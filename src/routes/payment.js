const express = require("express");
const paymentRouter = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const OrderModel = require("../models/order"); // make sure you have this file created
const { userAuth } = require("../middlewares/auth");

// Plan details in paise (₹999.00 → 99900 paise)
const PLANS = {
  gold: { amount: 99900, name: "Gold Plan" },
  silver: { amount: 49900, name: "Silver Plan" },
};

paymentRouter.post("/create-checkout-session", userAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate plan
    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    // Create order in DB
    const order = await OrderModel.create({
      userId: req.user._id,
      plan,
      amount: PLANS[plan].amount,
      currency: "inr",
      paymentStatus: "pending",
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: PLANS[plan].name,
            },
            unit_amount: PLANS[plan].amount,
          },
          quantity: 1,
        },
      ],
      customer_creation: "always", // ensures a customer object is created
      billing_address_collection: "required", // collects name and address
      success_url: `${process.env.CLIENT_URL}/premium`,
      cancel_url: `${process.env.CLIENT_URL}/premium`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    // Save session ID in order
    order.stripeSessionId = session.id;
    await order.save();

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong while creating session" });
  }
});

module.exports = paymentRouter;
