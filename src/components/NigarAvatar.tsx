export function NigarAvatar({ size = 40, online = true }: { size?: number; online?: boolean }) {
  return (
    <span className="nigar-avatar" style={{ width: size, height: size }} aria-hidden>
      <span className="nigar-avatar-core">Р</span>
      {online ? <span className="nigar-online" /> : null}
    </span>
  );
}
