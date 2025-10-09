import { useState, useEffect } from 'react'
import './Promotion.css'

export default function Promotion() {
  const [promotions, setPromotions] = useState([])
  const [formData, setFormData] = useState({
    promo_code: '',
    description: '',
    discount_type: '',
    discount_value: '',
    start_date: '',
    end_date: '',
    min_order_amount: '',
    usage_limit: '',
    used_count: '',
    status: ''
  })
  const [editingId, setEditingId] = useState(null)

  // Giả lập fetch dữ liệu
  useEffect(() => {
    setPromotions([
      {
        promo_id: 1,
        promo_code: 'SALE10',
        description: 'Giảm 10%',
        discount_type: 'percent',
        discount_value: 10,
        start_date: '2025-10-01',
        end_date: '2025-10-31',
        min_order_amount: 100,
        usage_limit: 50,
        used_count: 5,
        status: 'active'
      }
    ])
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setPromotions(promotions.map(p => p.promo_id === editingId ? { ...p, ...formData } : p))
      setEditingId(null)
    } else {
      setPromotions([...promotions, { promo_id: Date.now(), ...formData }])
    }
    setFormData({
      promo_code: '', description: '', discount_type: '',
      discount_value: '', start_date: '', end_date: '',
      min_order_amount: '', usage_limit: '', used_count: '', status: ''
    })
  }

  const handleEdit = (promo) => {
    setFormData(promo)
    setEditingId(promo.promo_id)
  }

  const handleDelete = (id) => {
    setPromotions(promotions.filter(p => p.promo_id !== id))
  }

  return (
    <div className="PromotionWrapper">
      <h2>Promotion Management</h2>

      <form className="PromotionForm" onSubmit={handleSubmit}>
        <input name="promo_code" placeholder="Promo Code" value={formData.promo_code} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        <select name="discount_type" value={formData.discount_type} onChange={handleChange}>
          <option value="">--Discount Type--</option>
          <option value="percent">Percent</option>
          <option value="amount">Amount</option>
        </select>
        <input name="discount_value" type="number" placeholder="Discount Value" value={formData.discount_value} onChange={handleChange} />
        <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
        <input name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
        <input name="min_order_amount" type="number" placeholder="Min Order" value={formData.min_order_amount} onChange={handleChange} />
        <input name="usage_limit" type="number" placeholder="Usage Limit" value={formData.usage_limit} onChange={handleChange} />
        <input name="used_count" type="number" placeholder="Used Count" value={formData.used_count} onChange={handleChange} />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="">--Status--</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
      </form>

      <table className="PromotionTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Description</th>
            <th>Type</th>
            <th>Value</th>
            <th>Start</th>
            <th>End</th>
            <th>Min Order</th>
            <th>Limit</th>
            <th>Used</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map(p => (
            <tr key={p.promo_id}>
              <td>{p.promo_id}</td>
              <td>{p.promo_code}</td>
              <td>{p.description}</td>
              <td>{p.discount_type}</td>
              <td>{p.discount_value}</td>
              <td>{p.start_date}</td>
              <td>{p.end_date}</td>
              <td>{p.min_order_amount}</td>
              <td>{p.usage_limit}</td>
              <td>{p.used_count}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.promo_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
