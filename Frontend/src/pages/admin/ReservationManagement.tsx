import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Reservation {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  table: {
    id: number;
    tableName: string;
    capacity: number;
    status: string;
  };
  numPeople: number;
  reservationTime: string;
  status: string;
  content: string;
}

const ReservationManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = async () => {
    try {
      const response = await axiosClient.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const handleDeleteReservation = async (id: number) => {
    try {
      await axiosClient.delete(`/reservations/${id}`);
      setReservations(reservations.filter((reservation) => reservation.id !== id));
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reservation Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>People</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation, index) => (
            <TableRow key={reservation.id}>
              <TableCell>{index+1}</TableCell>
              <TableCell>{reservation.user.name}</TableCell>
              <TableCell>{reservation.table.tableName}</TableCell>
              <TableCell>{reservation.numPeople}</TableCell>
              <TableCell>{new Date(reservation.reservationTime).toLocaleString()}</TableCell>
              <TableCell>{reservation.status}</TableCell>
              <TableCell>{reservation.content}</TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => handleDeleteReservation(reservation.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReservationManagement;