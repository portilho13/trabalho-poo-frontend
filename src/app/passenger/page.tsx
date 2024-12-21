'use client'

import { useEffect, useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import PassengerDashboardLayout from './passanger-dashboard-layout';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
}

interface Booking {
  id: number;
  reservationCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
}

interface UserData {
  name: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchFlights();
    if (flights.length > 0)
      fetchBookings();
  }, []);

  const fetchFlight: any = async (flightNumber: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/flight/${flightNumber}`);
      const data = await response.json();
      return {
        origin: data.origin,
        destination: data.destination,
        departureTime: data.scheduledDateTime,
      }; // Return flight details
    } catch (error) {
      console.error('Error fetching flight:', error);
      return null; // Return a default value if the fetch fails
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/SessionManager/GetPassengerReservations');
      const data = await response.json();

      if (data.message === 'No reservations found for the logged-in passenger') {
        setBookings([]);
        return;
      }

      // Use Promise.all to handle multiple asynchronous fetch calls
      const formattedBookings: Booking[] = await Promise.all(
        data.map(async (booking: any, index: number) => {
          const flightData = await fetchFlight(booking.flightNumber); // Wait for flight details
          return {
            id: index + 1,
            flightNumber: booking.flightNumber,
            reservationCode: booking.reservationCode,
            origin: flightData.origin.airportName,
            destination: flightData.destination.airportName,
            departureTime: flightData.departureTime,
          };
        })
      );
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const fetchUserData = async () => {
    const response = await fetch('http://localhost:5000/api/SessionManager/GetLoggedInUser');

    const data = await response.json();
    if (data.message === 'No user is currently logged in') router.push('/');
    setUserData({ name: data.name });
  };

  const buyTicket = async (flightNumber: string) => {
    const response = await fetch(`http://localhost:5000/api/flight/${flightNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FlightNumber: flightNumber,
        Name: userData?.name,
      }),
    });

    const data = await response.json();
    const req = await fetch('http://localhost:5000/api/SessionManager/AddPassengerReservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FlightNumber: flightNumber,
        ReservationCode: data.message,
      }),
    });

    if (!req.ok) throw new Error('Failed to add reservation data');

    fetchBookings();
  };

  const fetchFlights = async () => {
    const response = await fetch('http://localhost:5000/api/flight');
    if (!response.ok) throw new Error('Failed to fetch flights');

    const data = await response.json();

    if (data.length === 0) {
      setFlights([])
      return;
    }

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

    setFlights(formattedFlights);
  };

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
                  {flights.map((flight) => {
                    const isBooked = bookings.some(
                      (booking) => booking.flightNumber === flight.flightNumber
                    );

                    return (
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
                          {isBooked ? (
                            <button
                              disabled
                              className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed text-sm"
                            >
                              Bought
                            </button>
                          ) : (
                            <button
                              onClick={() => buyTicket(flight.flightNumber)}
                              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm"
                            >
                              Buy Ticket
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
                    <div className="font-medium">
                      {booking.origin} → {booking.destination}
                    </div>
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
  );
}
