import "./LoadingState.scss"

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <div className="state-wrapper">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;