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
  reservationCode: string,
  flightNumber: string,
  origin: string,
  destination: string
  departureTime: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('search')
  const [flights, setFlights] = useState<Flight[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    fetchBookings()
    console.log(bookings)
  }, [])
  
  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/SessionManager/GetPassengerReservations');
      const data = await response.json();

      
      const bookingsArray = Array.isArray(data) ? data : data.bookings || [];
      
      const formattedBookings: Booking[] = await Promise.all(
        bookingsArray.map(async (booking: any, index: number) => {
          try {
            const resp = await fetch(`http://localhost:5000/api/flight/${booking.flightNumber}`);
            if (!resp.ok) {
              throw new Error(`Failed to fetch flight data for ${booking.flightNumber}`);
            }
            const flightData = await resp.json();
            
            return {
              id: index + 1,
              flightNumber: flightData.number || 'Unknown',
              origin: flightData.origin?.airportName || 'Unknown',
              destination: flightData.destination?.airportName || 'Unknown',
              departureTime: flightData.scheduledDateTime !== '0001-01-01T00:00:00'
                ? flightData.scheduledDateTime
                : null,
            };
          } catch (error) {
            console.error(`Error fetching flight ${booking.flightNumber}:`, error);
            return {
              id: index + 1,
              reservationCode: booking.reservationCode,
              flightNumber: booking.flightNumber || 'Unknown',
              origin: 'Unknown',
              destination: 'Unknown',
              departureTime: null,
            };
          }
        })
      );
      
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };
  

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
              {bookings.map((booking) => (
                <div
                  key={booking.flightNumber}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-gray-500">
                      Flight {booking.flightNumber}
                    </div>
                    <div className="font-medium">{booking.origin} → {booking.destination}</div>
                    <div className="text-sm text-gray-500">
                        {format(parseISO(booking.departureTime), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm`}
                    >
                      {booking.reservationCode}
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
