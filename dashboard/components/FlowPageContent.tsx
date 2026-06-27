type FlowPageContentProps = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

export function FlowPageContent({
  children,
  className = "",
}: FlowPageContentProps) {
  return (
    <main className={`flex-1 space-y-6 px-5 pb-8 pt-6 ${className}`}>
      {children}
    </main>
  );
}
