export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="app-frame relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
        {children}
      </div>
    </div>
  );
}
