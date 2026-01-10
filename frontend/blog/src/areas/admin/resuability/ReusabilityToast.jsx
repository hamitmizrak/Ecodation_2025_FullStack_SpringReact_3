// rfce
// admin/reusability/ReusabilityToast.jsx
// npm install react-hot-toast
import React from 'react';
import {Toaster} from "react-hot-toast";

export default function ResuabilityToast (
    {
        position="bottom-right",
        duration=3000,
        ...props
    }
) {
    return (
        <Toaster
            position={position}
            toastOptions={{
                duration,
                style: { borderRadius: "10px", padding: "10px" },
                success: { icon: "✅" },
                error: { icon: "⚠️" },
            }}
            {...props}
        />
    );
}

