import './greenButton.scss';

export default function GreenButton({ label, onClick, disabled }) {
  return (
    <button className="green-button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}