const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCustomer = async (params) => {
  try {
    const customer = await Stripe.customers.create({
      name: params.name,
      email: params.email,
      phone: params.phone,
      metadata: {
        customerId: params.id,
      },
    });

    return customer;
  } catch (err) {
    return err;
  }
};

exports.updateCustomerPaymentMethod = async (params) => {
  try {
    await Stripe.paymentMethods.attach(params.payment_method, {
      customer: params.customerId,
    });
  } catch (err) {
    return err;
  }
};

exports.generatePaymentIntent = async (params) => {
  try {
    const paymentIntent = await Stripe.paymentIntents.create({
      receipt_email: params.receipt_email,
      amount: params.amount,
      currency: params.currency,
      payment_method: params.payment_method,
      customer: params.customer,
      payment_method_types: ['card'],
    });

    return paymentIntent;
  } catch (err) {
    return err;
  }
};

exports.charge = async (params) => {
  try {
    const charge = await Stripe.charges.create({
      amount: params.amount,
      currency: 'usd',
      source: params.payment_method,
      // customer: params.customer,
    });

    return charge;
  } catch (err) {
    return err;
  }
};
