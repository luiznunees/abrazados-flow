import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserCheck, Clock, CheckCircle, Search, Download, QrCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registration_date: string;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'checked_in';
  checked_in: boolean;
  checked_in_at: string | null;
  qr_code: string;
}

interface AdminStats {
  total_registrations: number;
  paid_registrations: number;
  checked_in_count: number;
  pending_registrations: number;
}

export const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_registrations: 0,
    paid_registrations: 0,
    checked_in_count: 0,
    pending_registrations: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
    fetchStats();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      toast.error('Erro ao carregar inscrições');
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_stats')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((reg) => reg.status === statusFilter);
    }

    setFilteredRegistrations(filtered);
  };

  const handleCheckIn = async (registrationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          checked_in: !currentStatus,
          checked_in_at: !currentStatus ? new Date().toISOString() : null,
          status: !currentStatus ? 'checked_in' : 'paid'
        })
        .eq('id', registrationId);

      if (error) throw error;
      
      toast.success(!currentStatus ? 'Check-in realizado com sucesso!' : 'Check-in removido');
      fetchRegistrations();
      fetchStats();
    } catch (error) {
      toast.error('Erro ao realizar check-in');
      console.error('Error updating check-in:', error);
    }
  };

  const updatePaymentStatus = async (registrationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: newStatus as any })
        .eq('id', registrationId);

      if (error) throw error;
      
      toast.success('Status atualizado com sucesso!');
      fetchRegistrations();
      fetchStats();
    } catch (error) {
      toast.error('Erro ao atualizar status');
      console.error('Error updating status:', error);
    }
  };

  const syncMercadoPago = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-mercado-pago');
      
      if (error) throw error;
      
      toast.success('Sincronização com Mercado Pago concluída!');
      fetchRegistrations();
      fetchStats();
    } catch (error) {
      toast.error('Erro ao sincronizar com Mercado Pago');
      console.error('Error syncing with Mercado Pago:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'Cidade', 'Data Inscrição', 'Status', 'Check-in'],
      ...filteredRegistrations.map(reg => [
        reg.name,
        reg.email,
        reg.phone,
        reg.city,
        new Date(reg.registration_date).toLocaleDateString('pt-BR'),
        reg.status,
        reg.checked_in ? 'Sim' : 'Não'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscricoes_abrazados_sap_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pendente' },
      confirmed: { variant: 'outline', label: 'Confirmado' },
      paid: { variant: 'default', label: 'Pago' },
      cancelled: { variant: 'destructive', label: 'Cancelado' },
      checked_in: { variant: 'default', label: 'Presente' }
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Gerencie inscrições e check-ins do evento Abrazados SAP</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inscritos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_registrations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.paid_registrations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presentes no Evento</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.checked_in_count}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending_registrations}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="registrations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registrations">Inscrições</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestão de Inscrições</CardTitle>
                    <CardDescription>
                      Visualize e gerencie todas as inscrições do evento
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={syncMercadoPago} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Mercado Pago
                    </Button>
                    <Button onClick={exportToCSV} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="all">Todos os status</option>
                    <option value="pending">Pendentes</option>
                    <option value="paid">Pagos</option>
                    <option value="checked_in">Presentes</option>
                  </select>
                </div>
              </CardHeader>
              
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.name}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>{registration.phone}</TableCell>
                        <TableCell>{registration.city}</TableCell>
                        <TableCell>
                          {new Date(registration.registration_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <select
                              value={registration.status}
                              onChange={(e) => updatePaymentStatus(registration.id, e.target.value)}
                              className="text-sm px-2 py-1 border rounded"
                            >
                              <option value="pending">Pendente</option>
                              <option value="paid">Pago</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin">
            <Card>
              <CardHeader>
                <CardTitle>Check-in do Evento</CardTitle>
                <CardDescription>
                  Marque a presença dos participantes no evento
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou QR code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations
                      .filter(reg => reg.status === 'paid' || reg.status === 'checked_in')
                      .map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.name}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell className="font-mono text-sm">{registration.qr_code}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant={registration.checked_in ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleCheckIn(registration.id, registration.checked_in)}
                          >
                            {registration.checked_in ? 'Remover Check-in' : 'Fazer Check-in'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};