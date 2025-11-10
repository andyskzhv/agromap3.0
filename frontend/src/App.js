import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import Mercados from './pages/Mercados';
import FormularioMercado from './pages/FormularioMercado';
import Productos from './pages/Productos';
import GestionProductos from './pages/GestionProductos';
import DetalleProducto from './pages/DetalleProducto';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  return (
    <Router>
      <ToastProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/mercados" element={<Mercados />} />
          <Route path="/mercado/crear" element={<FormularioMercado />} />
          <Route path="/mercado/editar" element={<FormularioMercado />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<DetalleProducto />} />
          <Route path="/gestion-productos" element={<GestionProductos />} />
          <Route path="/admin" element={<DashboardAdmin />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;