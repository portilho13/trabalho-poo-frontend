import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// Define the type for a Flight
type Flight = {
  id: number;
  flightNumber: string;
  origin: string | null;
  destination: string | null;
  departureTime: string | null;
  registration: string | null;
};

type Aircraft = {
  id: number;
  model: string;
  capacity: number;
  registration: string;
};

interface Airport {
  id: number;
  code: string;
  name: string;
  icao: string;
}

export default function FlightManagement() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const router = useRouter()


  const fetchAirplanes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fleet');
      if (!response.ok) throw new Error('Failed to fetch aircraft data');
      const data = await response.json();
      const formattedData = data.map((aircraft: any, index: number) => ({
        id: index + 1,
        model: aircraft.model,
        capacity: aircraft.capacity,
        registration: aircraft.registration,
      }));
      setAircraft(formattedData);
    } catch (error) {
      console.error('Error fetching aircraft:', error);
    }
  };

  const fetchAirports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/airport', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get airports');
      }

      const data = await response.json();

      const formattedAirports = data.map((airport: any, index: number) => ({
        id: index + 1,
        code: airport.iata,
        name: airport.airportName,
        icao: airport.icao,
      }));

      setAirports(formattedAirports);
    } catch (error) {
      console.error('Error fetching airports:', error);
    }
  };

  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    registration: '',
  });

  // Fetch flights from the API
  const fetchFlights = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flight'); // Replace with the actual endpoint
      if (!response.ok) throw new Error('Failed to fetch flights');

      const data = await response.json();

      // Map response to match frontend structure
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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFlights();
    fetchAirplanes();
    fetchAirports();
  }, []);

  const addFlight = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find the selected origin and destination airport details
    const originAirport = airports.find(airport => airport.code === newFlight.origin);
    const destinationAirport = airports.find(airport => airport.code === newFlight.destination);

    // Find the selected aircraft details
    const selectedAircraft = aircraft.find(plane => plane.registration === newFlight.registration);

    try {
      const response = await fetch('http://localhost:5000/api/flight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Number": newFlight.flightNumber,
          "Origin": {
            "Name": originAirport?.name,
            "IATA": originAirport?.code,
            "ICAO": originAirport?.icao
          },
          "Destination": {
            "Name": destinationAirport?.name,
            "IATA": destinationAirport?.code,
            "ICAO": destinationAirport?.icao
          },
          "Airplane": {
            "Company": 'Ryanair', // You might want to make this dynamic
            "Registration": selectedAircraft?.registration,
            "IsOccupied": false,
            "Capacity": selectedAircraft?.capacity,
            "Model": selectedAircraft?.model
          },
          "ScheduledDateTime": newFlight.departureTime
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add flight');
      }

      const result = await response.json();
      console.log(result.message); // Optional success message
      await fetchFlights(); // Refresh flights
      setNewFlight({
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        registration: '',
      });
    } catch (error) {
      console.error('Error adding flight:', error);
    }
  };

  // Delete a flight by ID
  const deleteFlight = async (flightNumber: string) => {
    try {
        const response = await fetch(`http://localhost:5000/api/flight/${flightNumber}`, {
          method: 'DELETE',
        })

      if (!response.ok) throw new Error('Failed to delete aircraft')

      // Refresh the list after deleting the aircraft
      fetchFlights()
    } catch (error) {
      console.error('Error deleting aircraft:', error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Flight Management</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Flight Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Origin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departure Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Airplane Registration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {flights.map((flight) => (
            <tr key={flight.id} onClick={() => router.push(`/staff/flight/${flight.flightNumber}`)} className='cursor-pointer'>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {flight.flightNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {flight.origin || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {flight.destination || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {flight.departureTime
                  ? format(new Date(flight.departureTime), 'yyyy-MM-dd HH:mm')
                  : 'Not Scheduled'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {flight.registration || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling to the row
                    deleteFlight(flight.flightNumber);
                  }}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                  aria-label="Delete Flight"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={addFlight} className="mt-6">
        <div className="grid grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Flight Number"
            value={newFlight.flightNumber}
            onChange={(e) =>
              setNewFlight({ ...newFlight, flightNumber: e.target.value })
            }
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          />
          <select
            value={newFlight.origin}
            onChange={(e) => setNewFlight({ ...newFlight, origin: e.target.value })}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          >
            <option value="" disabled>
              Select Origin
            </option>
            {airports.map((airport) => (
              <option key={airport.id} value={airport.code}>
                {airport.name} ({airport.code})
              </option>
            ))}
          </select>
          <select
            value={newFlight.destination}
            onChange={(e) =>
              setNewFlight({ ...newFlight, destination: e.target.value })
            }
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          >
            <option value="" disabled>
              Select Destination
            </option>
            {airports.map((airport) => (
              <option key={airport.id} value={airport.code}>
                {airport.name} ({airport.code})
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            placeholder="Departure Time"
            value={newFlight.departureTime}
            onChange={(e) =>
              setNewFlight({ ...newFlight, departureTime: e.target.value })
            }
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          />
          <select
            value={newFlight.registration}
            onChange={(e) =>
              setNewFlight({ ...newFlight, registration: e.target.value })
            }
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          >
            <option value="" disabled>
              Select Airplane
            </option>
            {aircraft.map((plane) => (
              <option key={plane.id} value={plane.registration}>
                {plane.registration} - {plane.model}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Flight
        </button>
      </form>
    </div>
  );
}