/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axiosClient from '@/apis/axiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Users, Calendar, MessageSquare, Check, X, Table2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Table {
  id: number;
  tableName: string;
  capacity: number;
  status: 'BOOKED' | 'NOT_BOOKED';
}

const ReservationPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [numPeople, setNumPeople] = useState<number>(2);
  const [reservationTime, setReservationTime] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReservationForm, setShowReservationForm] = useState<boolean>(false);

  // Fetch all tables when the component mounts
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axiosClient.get('/tables');
        setTables(response.data);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
        toast.error('Failed to fetch tables.');
      }
    };
    fetchTables();
  }, []);

  // Handle table selection
  const handleSelectTable = (table: Table) => {
    if (table.status === 'BOOKED') {
      toast.error('This table is already booked.');
      return;
    }
    setSelectedTable(table);
    setShowReservationForm(true);
    setNumPeople(2);
    setReservationTime('');
    setContent('');
  };

  // Handle reservation submission
  const handleReserve = async () => {
    if (!user) {
      toast.error('Please log in to make a reservation.');
      return;
    }

    if (!selectedTable || !reservationTime || numPeople <= 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      await axiosClient.post('/reservations', {
        tableId: selectedTable.id,
        numPeople,
        reservationTime,
        content,
      });

      toast.success('Reservation successful!');

      // Update the table status in the UI
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === selectedTable.id ? { ...table, status: 'BOOKED' } : table
        )
      );

      // Reset form and selection
      setShowReservationForm(false);
      setSelectedTable(null);
      setNumPeople(2);
      setReservationTime('');
      setContent('');
    } catch (error: any) {
      console.error('Failed to reserve:', error);
      toast.error('Failed to reserve table: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  // Reset form when closing
  const handleCancel = () => {
    setShowReservationForm(false);
    setSelectedTable(null);
    setNumPeople(2);
    setReservationTime('');
    setContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold font-poppins text-gray-900">Reserve Your Table</h2>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          Book a table at Coffee Shop for a cozy and delightful experience. Choose a table and time that suits you!
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto flex flex-col lg:flex-row gap-8">
        {/* Tables List */}
        <div className="lg:w-2/3">
          <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-4 flex items-center">
            <Table2 className="w-5 h-5 mr-2 text-teal-500" />
            Available Tables
          </h3>
          {tables.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {tables.map((table) => (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-300 ${
                        table.status === 'BOOKED'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                      }`}
                      onClick={() => handleSelectTable(table)}
                    >
                      <div className="flex items-center space-x-4">
                        <Table2 className="w-6 h-6 text-teal-500" />
                        <div>
                          <h4 className="text-base font-medium text-gray-900">{table.tableName}</h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Capacity: {table.capacity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium ${
                            table.status === 'BOOKED' ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {table.status === 'BOOKED' ? 'Booked' : 'Not booked'}
                        </span>
                        {table.status === 'BOOKED' ? (
                          <X className="w-5 h-5 text-red-500" />
                        ) : (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-gray-500">No tables available.</p>
          )}
        </div>

        {/* Reservation Form (Sidebar on Desktop) */}
        <AnimatePresence>
          {showReservationForm && selectedTable && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="lg:w-1/3"
            >
              <Card className="sticky top-24 bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-poppins text-gray-900">
                    <Table2 className="w-5 h-5 mr-2 text-teal-500" />
                    Reserve {selectedTable.tableName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="Number of People"
                      value={numPeople}
                      onChange={(e) => setNumPeople(Number(e.target.value))}
                      min="1"
                      className="w-full border-gray-300 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <Input
                      type="datetime-local"
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      className="w-full border-gray-300 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    <Textarea
                      placeholder="Special requests or notes (optional)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full border-gray-300 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleReserve}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReservationPage;