import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  if (!user.phoneVerified) {
    redirect('/?verify=phone');
  }

  if (!user.role) {
    redirect('/?select=role');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏠</div>
              <h1 className="text-xl font-bold text-gray-900">
                Nigeria Rental Platform
              </h1>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back! 👋
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Phone:</span> {user.phoneNumber}
            </p>
            {user.email && (
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
            )}
            <p>
              <span className="font-medium">Role:</span>{' '}
              <span className="capitalize">{user.role}</span>
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Verified
              </span>
            </p>
          </div>
        </div>

        {/* Role-specific content */}
        {user.role === 'tenant' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🔍 Find Your Perfect Home
            </h3>
            <p className="text-blue-800 mb-4">
              Browse available properties, save favorites, and submit reviews.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Browse Properties
            </button>
          </div>
        )}

        {user.role === 'landlord' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🏢 Manage Your Properties
            </h3>
            <p className="text-green-800 mb-4">
              Upload property listings, manage inquiries, and track applications.
            </p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Add Property
            </button>
          </div>
        )}

        {user.role === 'agent' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              🤝 Connect Tenants & Landlords
            </h3>
            <p className="text-purple-800 mb-4">
              Manage your portfolio, list properties, and facilitate connections.
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
              View Portfolio
            </button>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">🎉 Authentication Complete!</span>{' '}
            Your account is fully verified and ready. Future features like property
            uploads, search, reviews, and admin moderation will integrate seamlessly
            with this authentication system.
          </p>
        </div>
      </main>
    </div>
  );
}

