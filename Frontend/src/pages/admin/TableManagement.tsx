import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-toastify';

interface Table {
  id: number;
  tableName: string;
  capacity: number;
  status: string;
}

const TableManagement = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [newTable, setNewTable] = useState({ tableName: '', capacity: 0 });
  const [editTable, setEditTable] = useState<Table | null>(null);

  const fetchTables = async () => {
    try {
      const response = await axiosClient.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      toast.error('Failed to fetch tables');
    }
  };

  const handleCreateTable = async () => {
    if (!newTable.tableName || newTable.tableName.trim() === '') {
      toast.error('Table name cannot be empty');
      return;
    }
    if (newTable.capacity <= 0) {
      toast.error('Capacity must be greater than 0');
      return;
    }

    try {
      const response = await axiosClient.post('/tables', {
        tableName: newTable.tableName,
        capacity: newTable.capacity,
        status: 'NOT_BOOKED',
      });
      setTables([...tables, response.data]);
      setNewTable({ tableName: '', capacity: 0 });
      toast.success('Table created successfully');
    } catch (error) {
      console.error('Failed to create table:', error);
      toast.error('Failed to create table');
    }
  };

  const handleUpdateTable = async () => {
    if (!editTable) return;
    if (editTable.capacity <= 0) {
      toast.error('Capacity must be greater than 0');
      return;
    }
    if (!editTable.tableName || editTable.tableName.trim() === '') {
      toast.error('Table name cannot be empty');
      return;
    }

    try {
      const response = await axiosClient.put(`/tables/${editTable.id}`, {
        tableName: editTable.tableName,
        capacity: editTable.capacity,
        status: editTable.status,
      });
      setTables(tables.map((table) => (table.id === editTable.id ? response.data : table)));
      setEditTable(null);
      toast.success('Table updated successfully');
    } catch (error) {
      console.error('Failed to update table:', error);
      toast.error('Failed to update table');
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      await axiosClient.delete(`/tables/${id}`);
      setTables(tables.filter((table) => table.id !== id));
      toast.success('Table deleted successfully');
    } catch (error) {
      console.error('Failed to delete table:', error);
      toast.error('Failed to delete table');
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Table Management</h2>
      <div className="mb-4 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Table Name</label>
          <Input
            type="text"
            placeholder="Enter table name"
            value={newTable.tableName}
            onChange={(e) => setNewTable({ ...newTable, tableName: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Capacity</label>
          <Input
            type="number"
            placeholder="Enter capacity"
            value={newTable.capacity}
            onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
          />
        </div>
        <Button onClick={handleCreateTable}>Create Table</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Table Name</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table, index) => (
            <TableRow key={table.id}>
              <TableCell>{index+1}</TableCell>
              <TableCell>{table.tableName}</TableCell>
              <TableCell>{table.capacity}</TableCell>
              <TableCell>{table.status}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={() => setEditTable(table)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Table</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Table Name</label>
                      <Input
                        type="text"
                        placeholder="Enter table name"
                        value={editTable?.tableName || ''}
                        onChange={(e) => setEditTable({ ...editTable!, tableName: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Capacity</label>
                      <Input
                        type="number"
                        placeholder="Enter capacity"
                        value={editTable?.capacity || 0}
                        onChange={(e) => setEditTable({ ...editTable!, capacity: Number(e.target.value) })}
                      />
                    </div>
                    <Button onClick={handleUpdateTable}>Save</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => handleDeleteTable(table.id)}>
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

export default TableManagement;