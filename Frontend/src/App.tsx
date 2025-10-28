import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { publicRoutes, privateRoutes, adminRoutes } from "./routes";
import { UserInfo } from "./interfaces/user";
import { JSX } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const App = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const ProtectedRoute = ({
    children,
    requiredRole,
  }: {
    children: JSX.Element;
    requiredRole?: UserInfo["role"];
  }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {publicRoutes.map(({ path, component: Component, layout: Layout }) => {
        return (
          <Route
            key={path}
            path={path}
            element={
              Layout ? (
                <Layout>
                  <Component />
                </Layout>
              ) : (
                <Component />
              )
            }
          />
        );
      })}

      {privateRoutes.map(({ path, component: Component, layout: Layout }) => {
        return (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                {Layout ? (
                  <Layout>
                    <Component />
                  </Layout>
                ) : (
                  <Component />
                )}
              </ProtectedRoute>
            }
          />
        );
      })}

      {adminRoutes.map(({ path, component: Component, layout: Layout }) => {
        return (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                    <SidebarTrigger className="-ml-1" />
                    {Layout ? (
                      <Layout>
                        <div className="p-10">
                          <Component />
                        </div>
                      </Layout>
                    ) : (
                      <div className="p-10">
                        <Component />
                      </div>
                    )}
                  </SidebarInset>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
        );
      })}
    </Routes>
  );
};

export default App;
