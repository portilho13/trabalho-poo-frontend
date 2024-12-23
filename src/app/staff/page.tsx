'use client'

import { useEffect, useState } from 'react'
import AirportManagement from '../components/AirportManagement'
import AirplaneManagement from '../components/AirplaneManagement'
import FlightManagement from '../components/FlightManagement'
import { useRouter } from 'next/navigation'

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('airports')
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const response = await fetch('http://localhost:5000/api/SessionManager/GetLoggedInUser');

    const data = await response.json();
    if (data.message === 'No user is currently logged in') router.push('/');
  };

  return (
    <div className="bg-white shadow text-black overflow-hidden sm:rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="-mb-px space-x-5 flex" aria-label="Tabs">
          {['airports', 'airplanes', 'flights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {activeTab === 'airports' && <AirportManagement />}
        {activeTab === 'airplanes' && <AirplaneManagement />}
        {activeTab === 'flights' && <FlightManagement />}
      </div>
    </div>
  )
}

