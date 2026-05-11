import { Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function BlogPageHeader() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-serif">Soko Blog</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Farming knowledge, market insights & success stories
        </p>
      </div>
      {isAuthenticated() && (
        <Link to="/blog/write">
          <Button size="sm" className="rounded-xl gap-1.5 font-semibold h-9">
            <PenLine size={14} />
            Write Article
          </Button>
        </Link>
      )}
    </div>
  );
}
