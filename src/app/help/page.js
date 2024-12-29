export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium">How to create an account</h3>
              <p className="text-gray-300">
                Creating an account is easy! Click the Sign Up button in the top right corner...
              </p>
              {/* Add more help content */}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Watching Content</h2>
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium">Streaming quality</h3>
              <p className="text-gray-300">
                We automatically adjust the streaming quality based on your internet connection...
              </p>
              {/* Add more help content */}
            </div>
          </section>

          {/* Add more sections as needed */}
        </div>
      </div>
    </div>
  );
} 