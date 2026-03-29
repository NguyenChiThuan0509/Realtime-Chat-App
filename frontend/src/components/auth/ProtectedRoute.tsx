import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, loading } = useAuthStore();
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        let { accessToken: token, user: currentUser } = useAuthStore.getState();
        if (!token) {
          await useAuthStore.getState().refresh();
          token = useAuthStore.getState().accessToken;
          currentUser = useAuthStore.getState().user;
        }
        if (token && !currentUser) {
          await useAuthStore.getState().fetchMe();
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  if (!accessToken) {
    return (
      <Navigate
        to="/signin"
        replace
      />
    );
  }

  return <Outlet></Outlet>;
};

export default ProtectedRoute;