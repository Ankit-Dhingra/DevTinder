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

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // Optional: Check if metadata contains orderId
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      console.warn("⚠ No orderId found in payment_intent.succeeded");
      return res.json({ received: true });
    }

    try {
      const order = await OrderModel.findById(orderId);
      if (!order) {
        console.warn(`⚠ Order not found for ID: ${orderId}`);
        return res.json({ received: true });
      }

      order.paymentStatus = "paid";
      order.stripePaymentIntentId = paymentIntent.id;
      await order.save();

      const user = await UserModel.findById(order.userId);
      if (user) {
        user.isPremium = true;
        await user.save();
      }

      console.log("✅ Payment successful, order and user updated");
    } catch (err) {
      console.error("❌ Error updating order:", err);
    }
  }

  if (event.type === "payment_intent.canceled") {
    const paymentIntent = event.data.object;
    console.log(`⚠ Payment canceled for PaymentIntent ${paymentIntent.id}`);
  }

  res.json({ received: true });
});

module.exports = webhookRouter;
