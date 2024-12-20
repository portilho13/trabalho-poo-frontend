"use client"

import { useEffect, useState } from 'react'
import { Search, Calendar } from 'lucide-react'
import PassengerDashboardLayout from './passanger-dashboard-layout'
import { format, parseISO } from 'date-fns';

interface Flight {
    id: number,
    flightNumber: string,
    origin: string,
    destination: string
    departureTime: string
}

interface Booking {
  id: number,
  flightNumber: string,
  origin: string,
  destination: string
  departureTime: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('search')
  const [flights, setFlights] = useState<Flight[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const availableFlights = [
    {
      id: '1',
      flightNumber: 'RYR321',
      origin: 'London',
      destination: 'Paris',
      departureTime: '2024-01-15 10:30',
    },
    {
      id: '2',
      flightNumber: 'RYR456',
      origin: 'Paris',
      destination: 'Rome',
      departureTime: '2024-01-16 14:45',
    },
    {
      id: '3',
      flightNumber: 'RYR789',
      origin: 'Rome',
      destination: 'Berlin',
      departureTime: '2024-01-17 08:15',
    }
  ]

  const myBookings = [
    {
      flightNumber: 'RYR321',
      route: 'London → Paris',
      departureTime: '2024-01-15 10:30',
      status: 'Upcoming'
    },
    {
      flightNumber: 'RYR456',
      route: 'Paris → Rome',
      departureTime: '2024-02-01 14:45',
      status: 'Completed'
    }
  ]

  const fetchFlights = async () => {
    const response = await fetch("http://localhost:5000/api/flight")
    if (!response.ok) throw new Error('Failed to fetch flights');

    const data = await response.json()

    console.log(data)

    const formattedFlights: Flight[] = data.map((flight: any, index: number) => {
        return {
          id: index + 1, // Add a unique ID
          flightNumber: flight.number || 'Unknown',
          origin: flight.origin?.airportName || 'Unknown',
          destination: flight.destination?.airportName || 'Unknown',
          departureTime:
            flight.scheduledDateTime !== '0001-01-01T00:00:00'
              ? flight.scheduledDateTime
              : null, // Skip default datetime
          registration: flight.airplane?.registration || 'Unknown',
        };
      });
    
    setFlights(formattedFlights)
  }
  
  useEffect(() => {
    fetchFlights()
  }, [])

  return (
    <PassengerDashboardLayout>
      <div className="space-y-6 text-black">
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'search'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="h-4 w-4" />
            Available Flights
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === 'bookings'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-4 w-4" />
            My Bookings
          </button>
        </div>

        {/* Available Flights Table */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Available Flights</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Flight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {flight.flightNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flight.origin} → {flight.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flight.departureTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
                          Buy Ticket
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">My Bookings</h2>
            </div>
            <div className="divide-y">
              {myBookings.map((flight) => (
                <div
                  key={flight.flightNumber}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-gray-500">
                      Flight {flight.flightNumber}
                    </div>
                    <div className="font-medium">{flight.route}</div>
                    <div className="text-sm text-gray-500">
                        {format(parseISO(flight.departureTime), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        flight.status === 'Upcoming'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {flight.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PassengerDashboardLayout>
  )
}
