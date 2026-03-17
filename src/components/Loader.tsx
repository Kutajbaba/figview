interface Props {
  message: string;
}

export function Loader({ message }: Props) {
  return (
    <div className="loader-wrap">
      <div className="loader-ring" />
      <span className="loader-msg">{message}</span>
    </div>
  );
}
