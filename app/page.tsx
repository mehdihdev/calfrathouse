
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Logo */}
      <div className="text-6xl font-bold text-gray-800 mb-4">calfrathouse</div>

      {/* Caption */}
      <p className="text-lg text-gray-600 mb-8">
      woo hoo our own house yay!
      </p>

      {/* Login Button */}
      <a
        href="/login"
        className="px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded hover:bg-blue-600"
      >
        Login
      </a>
    </div>
  );
}
