
export default function MomentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Moments</h1>
          <p className="mt-1 text-gray-600">Positive updates, insights, and system moments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-lg">✨ You logged your Daily State today</div>
            <p className="mt-1 text-sm text-gray-600">Keep up the great momentum.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-lg">🔥 Habit streak maintained</div>
            <p className="mt-1 text-sm text-gray-600">Consistency builds progress.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="text-lg">🎯 Goal milestone completed</div>
            <p className="mt-1 text-sm text-gray-600">Celebrate your wins.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
