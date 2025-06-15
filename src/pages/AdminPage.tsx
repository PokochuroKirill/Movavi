
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HARD_CODED_PASSWORD = "1467";

const AdminPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState("");

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
    <div className="min-h-screen flex flex-col bg-indigo-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <Card className="max-w-lg w-full shadow-xl mt-16 mb-24">
          <CardHeader>
            <CardTitle className="text-center">Админ-панель</CardTitle>
          </CardHeader>
          <CardContent>
            {!isAuthed ? (
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
            ) : (
              <div className="py-6 text-center">
                <div className="text-2xl font-bold mb-3 text-indigo-700 dark:text-indigo-200">Добро пожаловать, администратор!</div>
                <div className="text-gray-700 dark:text-gray-300 mb-2">Здесь будут появляться функции админ-панели.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
