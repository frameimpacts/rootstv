'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import DashboardSkeleton from '@/components/DashboardSkeleton';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    }
  }
};

export default function AdminDashboard() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentSales: [],
    topContent: [],
    userGrowth: [],
    dailyRevenue: []
  });

  useEffect(() => {
    if (session?.token) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, salesRes, topContentRes, growthRes] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${session.token}` }
        }),
        fetch('/api/admin/recent-sales', {
          headers: { 'Authorization': `Bearer ${session.token}` }
        }),
        fetch('/api/admin/top-content', {
          headers: { 'Authorization': `Bearer ${session.token}` }
        }),
        fetch('/api/admin/user-growth', {
          headers: { 'Authorization': `Bearer ${session.token}` }
        })
      ]);

      const [statsData, salesData, topContentData, growthData] = await Promise.all([
        statsRes.json(),
        salesRes.json(),
        topContentRes.json(),
        growthRes.json()
      ]);

      setStats({
        ...statsData,
        recentSales: salesData,
        topContent: topContentData,
        userGrowth: growthData
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sm font-medium text-gray-600">Analytics Overview</h1>
        <div className="flex items-center space-x-3">
          <select className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1.5 text-gray-600">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-medium hover:bg-red-100">
            Download Report
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-50 p-2 rounded-md">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400">+5.25%</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-gray-500">Total Revenue</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-50 p-2 rounded-md">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400">+12.5%</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">{stats.totalUsers.toLocaleString()}</h3>
          <p className="text-xs text-gray-500">Total Users</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-50 p-2 rounded-md">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400">+3.75%</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">{stats.totalMovies.toLocaleString()}</h3>
          <p className="text-xs text-gray-500">Total Content</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-50 p-2 rounded-md">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-400">+8.4%</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">{stats.activePurchases?.toLocaleString() || '0'}</h3>
          <p className="text-xs text-gray-500">Active Purchases</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-600">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-400">Daily Revenue</span>
            </div>
          </div>
          <div className="h-[240px]">
            <Line
              data={{
                labels: stats.dailyRevenue.map(d => d.date),
                datasets: [{
                  label: 'Daily Revenue',
                  data: stats.dailyRevenue.map(d => d.amount),
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { 
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                  },
                  y: { 
                    grid: { color: '#f3f4f6' },
                    ticks: { font: { size: 10 } }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-600">User Growth</h3>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-400">New Users</span>
            </div>
          </div>
          <div className="h-[240px]">
            <Bar
              data={{
                labels: stats.userGrowth.map(d => d.date),
                datasets: [{
                  label: 'New Users',
                  data: stats.userGrowth.map(d => d.count),
                  backgroundColor: 'rgba(239, 68, 68, 0.9)'
                }]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { 
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                  },
                  y: { 
                    grid: { color: '#f3f4f6' },
                    ticks: { font: { size: 10 } }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-600">Top Content</h3>
            <button className="text-xs text-gray-400 hover:text-gray-600">View All</button>
          </div>
          <div className="space-y-3">
            {stats.topContent.map((content) => (
              <TopContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-600">Recent Sales</h3>
            <button className="text-xs text-gray-400 hover:text-gray-600">View All</button>
          </div>
          <div className="space-y-3">
            {stats.recentSales.map((sale) => (
              <SaleCard key={sale.id} sale={sale} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function TopContentCard({ content }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-white">{content.title}</h4>
          <p className="text-sm text-gray-400">{content.type}</p>
        </div>
        <div className="text-right">
          <p className="text-green-500">₹{content.total_revenue?.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-400">{content.purchase_count} sales</p>
        </div>
      </div>
    </div>
  );
}

function SaleCard({ sale }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="flex justify-between">
        <div>
          <h4 className="font-semibold text-white">{sale.content_title}</h4>
          <p className="text-sm text-gray-400">{sale.user_name}</p>
          <p className="text-xs text-gray-500">Order #{sale.order_id}</p>
        </div>
        <div className="text-right">
          <p className="text-green-500">₹{parseFloat(sale.amount).toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-400">
            {new Date(sale.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">{sale.content_type}</p>
        </div>
      </div>
    </div>
  );
}
