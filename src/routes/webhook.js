// src/routes/payment.js
const express = require("express");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const OrderModel = require("../models/order");
const UserModel = require("../models/user");

const webhookRouter = express.Router();

webhookRouter.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // from Stripe dashboard
    );
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Find order using metadata
      const order = await OrderModel.findById(session.metadata.orderId);
      console.log("Order DB : ", order)
      console.log("OrderID DB : ", session.metadata.orderId)
      if (order) {
        order.paymentStatus = "paid";
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();

        const user = await UserModel.findById(order.userId);
        user.isPremium = true;
        await user.save();
        console.log("check User DB :" , user)
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  }

  res.json({ received: true });
});

module.exports = webhookRouter;
