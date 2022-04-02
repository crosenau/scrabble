import './greenButton.scss';

export default function GreenButton({ label, onClick }) {
  return (
    <button className="green-button" onClick={onClick}>
      {label}
    </button>
  );
}