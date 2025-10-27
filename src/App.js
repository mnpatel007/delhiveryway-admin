import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ShopsPage from './pages/ShopsPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import ShoppersPage from './pages/ShoppersPage';
import ShopperPerformancePage from './pages/ShopperPerformancePage';
import NoticesPage from './pages/NoticesPage';
import './App.css';

// Private route component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/shops" element={
                <PrivateRoute>
                  <ShopsPage />
                </PrivateRoute>
              } />
              <Route path="/products" element={
                <PrivateRoute>
                  <ProductsPage />
                </PrivateRoute>
              } />
              <Route path="/orders" element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              } />
              <Route path="/users" element={
                <PrivateRoute>
                  <UsersPage />
                </PrivateRoute>
              } />
              <Route path="/shoppers" element={
                <PrivateRoute>
                  <ShoppersPage />
                </PrivateRoute>
              } />
              <Route path="/shopper-performance" element={
                <PrivateRoute>
                  <ShopperPerformancePage />
                </PrivateRoute>
              } />
              <Route path="/notices" element={
                <PrivateRoute>
                  <NoticesPage />
                </PrivateRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
