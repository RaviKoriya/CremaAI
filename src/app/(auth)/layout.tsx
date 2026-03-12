export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1E3C] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#00C9A7] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3h8v8H3V3zm10 0h8v8h-8V3zm-10 10h8v8H3v-8zm13 4a4 4 0 100-8 4 4 0 000 8z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">LeadFlow</span>
          </div>
          <p className="text-blue-300 text-sm mt-1">AI-Powered CRM</p>
        </div>
        {children}
      </div>
    </div>
  );
}
