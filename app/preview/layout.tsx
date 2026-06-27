export default function PreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="app-frame relative mx-auto flex h-dvh max-h-dvh min-h-0 w-full max-w-md flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}
