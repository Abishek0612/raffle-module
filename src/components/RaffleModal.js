import React, { useState } from "react";

const RaffleModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const currentSite = window.location.hostname;

      const response = await fetch(
        "/.netlify/functions/create-ticket-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            site: currentSite,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      console.log("Session created:", data.sessionId);

      if (!window.Stripe) {
        const stripeScript = document.createElement("script");
        stripeScript.src = "https://js.stripe.com/v3/";
        stripeScript.async = true;
        document.head.appendChild(stripeScript);

        await new Promise((resolve) => {
          stripeScript.onload = resolve;
        });
      }

      const stripe = window.Stripe(
        process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
      );

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎫 Buy Raffle Ticket</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Enter the monthly raffle for just €1! Winners receive amazing prizes
            and all participants get a vote boost in Top216.
          </p>

          <form onSubmit={handleSubmit} className="raffle-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="confirm-button"
                disabled={isLoading || !formData.name || !formData.email}
              >
                {isLoading ? "Processing..." : "Confirm Purchase €1"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RaffleModal;
