
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import UserManagement from "@/components/admin/UserManagement";

// Градиент применяется на главный контейнер через gradient-bg. При этом card чуть прозрачней.

const HARD_CODED_PASSWORD = "1467";

const AdminPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === HARD_CODED_PASSWORD) {
      setIsAuthed(true);
      setError("");
    } else {
      setError("Неверный пароль");
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {!isAuthed ? (
          <div className="max-w-md mx-auto mt-20">
            <Card className="shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-gradient bg-clip-text">
                  Админ-панель
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium">
                      Пароль:
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mb-2">{error}</div>
                  )}
                  <Button type="submit" className="w-full">
                    Войти
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-gradient bg-clip-text">
                Добро пожаловать в админ-панель!
              </h1>
              <p className="text-muted-foreground">
                Управление пользователями и верификацией
              </p>
            </div>
            
            <UserManagement />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;

