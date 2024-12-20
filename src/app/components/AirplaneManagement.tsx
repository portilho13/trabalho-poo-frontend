'use client'

import React, { useState, useRef, useEffect } from 'react'
import { TrashIcon } from '@heroicons/react/20/solid' // Import the trash icon

type Aircraft = {
  id: number
  model: string
  capacity: number
  registration: string
}

export default function AircraftManagement() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]) // Initially empty, will be populated by API
  const [newAircraft, setNewAircraft] = useState<Aircraft>({
    id: 0,
    model: '',
    capacity: 0,
    registration: '',
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetching aircraft data from the API
  const fetchAirplanes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fleet')
      if (!response.ok) throw new Error('Failed to fetch aircraft data')
      const data = await response.json()
      const formattedData = data.map((aircraft: any, index: number) => ({
        id: index + 1,
        model: aircraft.model,
        capacity: aircraft.capacity,
        registration: aircraft.registration,
      }))
      setAircraft(formattedData)
    } catch (error) {
      console.error('Error fetching aircraft:', error)
    }
  }

  useEffect(() => {
    fetchAirplanes()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleModelChange = (model: string) => {
    const capacity = model === 'B737-8200' ? 197 : 186
    setNewAircraft({ ...newAircraft, model, capacity })
    setIsDropdownOpen(false)
  }

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAircraft({ ...newAircraft, registration: e.target.value })
  }

  const addAircraft = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newAircraft.model && newAircraft.registration) {
      try {
        // Prepare the data to send to the backend

        // Send POST request to add a new aircraft
        const response = await fetch('http://localhost:5000/api/fleet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "Company": "Ryanair",
            "Registration": newAircraft.registration,
            "IsOccupied": false,
            "Capacity": newAircraft.capacity,
            "Model": newAircraft.model
          }),
        })

        // Handle the different response statuses
        if (response.ok) {
          // Successfully created aircraft, refresh the list
          fetchAirplanes()

          // Reset the new aircraft form
          setNewAircraft({ id: 0, model: '', capacity: 0, registration: '' })
        } else {
          const errorResponse = await response.json()
          if (response.status === 400) {
            alert(errorResponse.Message)  // Display BadRequest message (data issues)
          } else if (response.status === 409) {
            alert(errorResponse.Message)  // Display Conflict message (duplicate registration)
          } else {
            alert('An unexpected error occurred.')
          }
        }
      } catch (error) {
        console.error('Error adding aircraft:', error)
      }
    }
  }


  const deleteAircraft = async (registration: string) => {
    try {
        const response = await fetch(`http://localhost:5000/api/fleet/${registration}`, {
          method: 'DELETE',
        })

      if (!response.ok) throw new Error('Failed to delete aircraft')

      // Refresh the list after deleting the aircraft
      fetchAirplanes()
    } catch (error) {
      console.error('Error deleting aircraft:', error)
    }
  }

  return (
    <div className="p-6 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Aircraft Management</h2>
      <table className="min-w-full divide-y divide-gray-200 mb-6">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {aircraft.map((plane) => (
            <tr key={plane.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plane.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plane.capacity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plane.registration}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => deleteAircraft(plane.registration)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={addAircraft} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {newAircraft.model || 'Select Aircraft Model'}
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  onClick={() => handleModelChange('B737-8200')}
                >
                  B737-8200
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  onClick={() => handleModelChange('B737-800')}
                >
                  B737-800
                </button>
              </div>
            )}
          </div>
          <input
            type="number"
            value={newAircraft.capacity || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Capacity"
            readOnly
          />
          <input
            type="text"
            value={newAircraft.registration}
            onChange={handleRegistrationChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Registration"
            required
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Aircraft
        </button>
      </form>
    </div>
  )
}
