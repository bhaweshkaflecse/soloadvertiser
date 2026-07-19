// Solo Advertiser — Business Portal
// Auth layout — no sidebar, centered card layout
// Used for login, register, verify-email, forgot-password

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900">Solo Advertiser</h1>
          <p className="mt-2 text-sm text-gray-600">Business Portal</p>
        </div>
        {/* Auth form card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
