import React, { useEffect, useState } from 'react';
import { useSubmitWidgetFormMutation } from '../../../redux/api/widgetApi';

const WidgetForm = () => {
    const [formData, setFormData] = useState({ pickup: '', dropoff: '' });
    const [companyId, setCompanyId] = useState('');
    const [submitWidgetForm] = useSubmitWidgetFormMutation(); // 🔥 RTK mutation hook

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cid = params.get("company");
        if (cid) setCompanyId(cid);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const referrer = document.referrer;

        try {
            await submitWidgetForm({ pickup: formData.pickup, dropoff: formData.dropoff, companyId, referrer }).unwrap();
            alert("✅ Submitted successfully");
            setFormData({ pickup: '', dropoff: '' });
        } catch (err) {
            console.error("❌ Submission Error:", err?.data?.message || err.error || err);
            alert("❌ Error submitting form");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: 20, fontFamily: 'Arial' }}>
            <h3>🚕 Book a Ride</h3>
            <input
                className="custom_input"
                type="text"
                placeholder="Pickup Location"
                value={formData.pickup}
                onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                required
            /><br /><br />
            <input
                className="custom_input"
                type="text"
                placeholder="Drop-off Location"
                value={formData.dropoff}
                onChange={(e) => setFormData({ ...formData, dropoff: e.target.value })}
                required
            /><br /><br />
            <button type="submit">Submit</button>
        </form>
    );
};

export default WidgetForm;
