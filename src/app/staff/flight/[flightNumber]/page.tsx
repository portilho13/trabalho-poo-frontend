'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';


interface Airport {
  airportName: string;
  iata: string;
  icao: string;
}

interface Airplane {
  company: string;
  registration: string;
  isOccupied: boolean;
  capacity: number;
  model: string;
}

interface PassengerReservation {
  passengerName: string;
  reservationCode: string;
}

interface PassengersReservations {
  [key: string]: PassengerReservation;
}

interface Flight {
  number: string;
  origin: Airport;
  destination: Airport;
  airplane: Airplane;
  scheduledDateTime: string;
  passengersReservations: PassengersReservations;
}

export default function FlightDashboard() {
  const params = useParams();
  const flightNumber = params.flightNumber;

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/flight/${flightNumber}`);
        if (!response.ok) {
          throw new Error('Failed to fetch flight data');
        }
        const data: Flight = await response.json();
        setFlight(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
  }, [flightNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading flight data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No flight data available.</p>
      </div>
    );
  }

  const passengers = Object.values(flight.passengersReservations);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold text-[#073590]">Ryanair</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 text-black py-8">
        {/* Flight Information Card */}
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
            Flight Details
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Flight Number</p>
              <p className="text-lg font-semibold">{flight.number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Route</p>
              <p className="text-lg font-semibold">
                {flight.origin.airportName} → {flight.destination.airportName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Departure Time</p>
              <p className="text-lg font-semibold">{flight.scheduledDateTime ? format(new Date(flight.scheduledDateTime), 'yyyy-MM-dd HH:mm') : 'Not Scheduled'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Aircraft</p>
              <p className="text-lg font-semibold">{flight.airplane.registration}</p>
            </div>
          </div>
        </div>

        {/* Passengers Table */}
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Passenger List
          </h2>
          <div className="overflow-x-auto">
            <div className='my-2'>Count: {passengers.length}</div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Booking Reference</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="px-4 py-2 font-medium">{passenger.passengerName}</td>
                    <td className="px-4 py-2">{passenger.reservationCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#073590] focus:ring-offset-2">
            Close Flight
          </button>
          <button className="rounded-md bg-[#073590] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#052a70] focus:outline-none focus:ring-2 focus:ring-[#073590] focus:ring-offset-2">
            Start Flight
          </button>
        </div>
      </main>
    </div>
  );
}
