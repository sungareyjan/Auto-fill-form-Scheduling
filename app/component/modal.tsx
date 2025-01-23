// components/Modal.js
import React, { ReactNode } from "react";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children,title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black rounded-lg shadow-lg max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="btn-red"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
        {/* <div className="p-4 border-t text-right">
          <button
            className="btn-red"
            onClick={onClose}
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Modal;
