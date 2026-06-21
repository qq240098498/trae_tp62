import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import OrderList from "@/pages/OrderList";
import OrderDetail from "@/pages/OrderDetail";
import PickupPage from "@/pages/PickupPage";
import PricingPage from "@/pages/PricingPage";
import CustomerList from "@/pages/CustomerList";
import CustomerDetail from "@/pages/CustomerDetail";
import RemnantList from "@/pages/RemnantList";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<OrderList />} />
          <Route path="/orders/new" element={<OrderDetail />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerDetail />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/remnants" element={<RemnantList />} />
          <Route path="/pickup" element={<PickupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
