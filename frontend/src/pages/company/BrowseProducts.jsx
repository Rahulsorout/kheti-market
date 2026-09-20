import { useEffect, useState } from "react";
import { getAllProducts } from "../../services/productService";
import { placeOrder } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";

export default function BrowseProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAllProducts().then(res => setProducts(res.data));
  }, []);

  const order = async (id) => {
    await placeOrder({ productId: id, quantity: 10 }, user.token);
    alert("Order placed");
  };

  return ( 
    <div>
      <h2>Browse Products</h2>
      {products.map(p => (
        <div key={p._id}>
          <p>{p.name} - ₹{p.pricePerUnit}</p>
          <button onClick={() => order(p._id)}>Order</button>
        </div>
      ))}
    </div>
  );
}
