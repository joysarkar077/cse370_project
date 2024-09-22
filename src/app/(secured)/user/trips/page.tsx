'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface RideRequest {
  request_id: number;
  user_id: number;
  origin: string;
  destination: string;
  total_fare: number;
  vehicle_type: string;
  total_passengers: number;
  total_accepted: number;
  ride_time: string;
  status: string;
}

const RidesPage = () => {
  const { data: session } = useSession();
  const [createdRides, setCreatedRides] = useState<RideRequest[]>([]);
  const [acceptedRides, setAcceptedRides] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchRides();
    }
  }, [session]);

  const fetchRides = async () => {
    try {
      const userId = session?.user.id;
      const createdRidesResponse = await axios.get(`/api/ride-requests/created/${userId}`);
      const acceptedRidesResponse = await axios.get(`/api/ride-requests/accepted/${userId}`);

      setCreatedRides(createdRidesResponse.data);
      setAcceptedRides(acceptedRidesResponse.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const handleDeleteRide = async (requestId: number) => {
    if (confirm('Are you sure you want to delete this ride?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/ride-requests/${requestId}`);

        alert('Ride deleted successfully.');
        fetchRides();
      } catch (error) {
        console.error('Error deleting ride:', error);
        alert('Failed to delete the ride.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRejectRide = async (requestId: number) => {
    if (confirm('Are you sure you want to reject this ride?')) {
      try {
        setLoading(true);
        await axios.post(`/api/ride-requests/reject`, {
          requestId,
          userId: session?.user.id,
        });

        // Send notifications to all participants about the rejection
        await axios.post(`/api/notifications/ride-rejected`, {
          requestId,
          userId: session?.user.id,
        });

        alert('You have rejected the ride.');
        fetchRides();
      } catch (error) {
        console.error('Error rejecting the ride:', error);
        alert('Failed to reject the ride.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Rides</h1>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Rides I Created</h2>
        {createdRides.length === 0 ? (
          <p>No rides created yet.</p>
        ) : (
          <ul className="space-y-4">
            {createdRides.map((ride) => (
              <li key={ride.request_id} className="p-4 bg-white shadow-md rounded-md">
                <p><strong>Origin:</strong> {ride.origin}</p>
                <p><strong>Destination:</strong> {ride.destination}</p>
                <p><strong>Fare:</strong> {ride.total_fare}</p>
                <p><strong>Ride Time:</strong> {new Date(ride.ride_time).toLocaleString()}</p>
                <p><strong>Status:</strong> {ride.status}</p>
                <div className="flex space-x-4 mt-2">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={() => handleDeleteRide(ride.request_id)}
                    disabled={loading}
                  >
                    Delete Ride
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Rides I Accepted</h2>
        {acceptedRides.length === 0 ? (
          <p>No rides accepted yet.</p>
        ) : (
          <ul className="space-y-4">
            {acceptedRides.map((ride) => (
              <li key={ride.request_id} className="p-4 bg-white shadow-md rounded-md">
                <p><strong>Origin:</strong> {ride.origin}</p>
                <p><strong>Destination:</strong> {ride.destination}</p>
                <p><strong>Fare:</strong> {ride.total_fare}</p>
                <p><strong>Ride Time:</strong> {new Date(ride.ride_time).toLocaleString()}</p>
                <p><strong>Status:</strong> {ride.status}</p>
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 mt-2"
                  onClick={() => handleRejectRide(ride.request_id)}
                  disabled={loading}
                >
                  Reject Ride
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RidesPage;
