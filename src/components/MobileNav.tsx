
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col gap-4">
          <a href="/projects" className="text-lg font-medium">Проекты</a>
          <a href="/snippets" className="text-lg font-medium">Сниппеты</a>
          <a href="/blog" className="text-lg font-medium">Блог</a>
          <a href="/community" className="text-lg font-medium">Сообщества</a>
        </div>
      </SheetContent>
    </Sheet>
  );
};

MobileNav.Content = () => null;

export { MobileNav };
