exports.handler = async (event, context) => {
  console.log("Function called with method:", event.httpMethod);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Missing Stripe configuration" }),
      };
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { name, email, site } = JSON.parse(event.body || "{}");

    if (!name || !email || !site) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Monthly Raffle Entry",
              description: `Raffle ticket for ${site}`,
            },
            unit_amount: 100, // €1.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://${site}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${site}/cancel`,
      customer_email: email,
      metadata: {
        customer_name: name,
        site: site,
        raffle_entry: "true",
      },
    });

    console.log("Session created:", session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error("Function error:", error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to create checkout session",
        details: error.message,
      }),
    };
  }
};
