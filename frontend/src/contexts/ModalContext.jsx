import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = (content) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 bg-grey bg-opacity-50 backdrop-blur-sm z-40" onClick={closeModal}></div>
      )}
      {isOpen && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 p-8 max-w-md w-full">
          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
          {modalContent}
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  return useContext(ModalContext);
};