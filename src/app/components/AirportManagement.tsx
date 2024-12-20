'use client';

import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';

interface Airport {
  id: number;
  code: string;
  name: string;
  icao: string;
}

export default function AirportManagement() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [newAirport, setNewAirport] = useState<Airport>({ id: 0, code: '', name: '', icao: '' });

  useEffect(() => {
    fetchAirports();
  }, []);

  // Fetch Airports
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



  // Add New Airport
  const addAirport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/airport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          airportName: newAirport.name,
          iata: newAirport.code,
          icao: newAirport.icao,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add airport');
      }

      // Update the local state to reflect the new airport
      setAirports([
        ...airports,
        { id: airports.length + 1, code: newAirport.code, name: newAirport.name, icao: newAirport.icao },
      ]);

      // Reset the form fields
      setNewAirport({ id: 0, code: '', name: '', icao: '' });
    } catch (error) {
      console.error('Error adding airport:', error);
    }
  };

  const deleteAirport = async (icao: string) => {
    const response = await fetch(`http://localhost:5000/api/airport/${icao}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to delete airport');
    }

    fetchAirports()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Airport Management</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICAO</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {airports.map((airport) => (
            <tr key={airport.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{airport.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{airport.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{airport.icao}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => deleteAirport(airport.icao)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={addAirport} className="mt-6">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Airport Code"
            value={newAirport.code}
            onChange={(e) => setNewAirport({ ...newAirport, code: e.target.value })}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Airport Name"
            value={newAirport.name}
            onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="ICAO"
            value={newAirport.icao}
            onChange={(e) => setNewAirport({ ...newAirport, icao: e.target.value })}
            className="shadow-sm p-2 px-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Airport
        </button>
      </form>
    </div>
  );
}
