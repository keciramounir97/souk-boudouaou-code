import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/admin/my-account", { replace: true });
  }, [navigate]);
  return null;
}
