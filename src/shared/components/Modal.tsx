interface ModalProps {
  children: React.ReactNode;
}

export function Modal({ children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-5">
      <div className="bg-bg-surface rounded-2xl p-7 max-w-[440px] w-full border border-bg-elevated">
        {children}
      </div>
    </div>
  );
}
