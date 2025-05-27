const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { name, email, site } = JSON.parse(event.body);

    if (!name || !email || !site) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: name, email, site",
        }),
      };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Monthly Raffle Entry",
              description: `Raffle ticket for ${site} monthly draw`,
              images: [
                "https://via.placeholder.com/300x200?text=Raffle+Ticket",
              ],
            },
            unit_amount: 100, // €1.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        event.headers.origin || "https://localhost:3000"
      }/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin || "https://localhost:3000"}/cancel`,
      customer_email: email,
      metadata: {
        customer_name: name,
        site: site,
        raffle_entry: "true",
      },
      payment_intent_data: {
        application_fee_amount: 20,
      },
    });

    console.log("Created session:", session.id, "for", email, "on", site);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
      }),
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);

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
