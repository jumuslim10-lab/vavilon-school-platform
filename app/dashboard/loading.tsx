export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="bg-gray-200 h-64 rounded-xl"></div>
    </div>
  )
}
