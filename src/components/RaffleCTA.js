import React, { useState } from "react";
import RaffleModal from "./RaffleModal";

const RaffleCTA = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="cl-raffle-cta">
        <button className="raffle-cta-button" onClick={handleOpenModal}>
          🎫 Buy a €1 Raffle Ticket
        </button>
        <p className="raffle-description">
          Monthly prize draw + vote boost in Top216!
        </p>
      </div>

      {isModalOpen && (
        <RaffleModal isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default RaffleCTA;
