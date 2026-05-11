import { useNavigate } from "@tanstack/react-router";

import { useMarketplaceStore } from "@/store/marketplace-store";

import { CategoryBadgeGroup } from "../ui/badge";
import { Button } from "../ui/button";

const CATEGORY_ITEMS = [
  { label: "All", image: "🛒" },
  { label: "Grains", image: "🌾" },
  { label: "Vegetables", image: "🥦" },
  { label: "Fruits", image: "🍎" },
  { label: "Herbs", image: "🌿" },
  { label: "Dairy", image: "🥛" },
  { label: "Poultry", image: "🐔" },
  { label: "Livestock", image: "🐄" },
  { label: "Fish", image: "🐟" },
  { label: "Other", image: "📦" },
];

const Categories = () => {
  const navigate = useNavigate();
  const setActiveCategory = useMarketplaceStore((s) => s.setActiveCategory);

  const handleCategoryChange = (val: string) => {
    setActiveCategory(val || "All");
    navigate({ to: "/marketplace" });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-semibold">Categories</h3>
        <Button variant="link" onClick={() => navigate({ to: "/marketplace" })}>
          See all
        </Button>
      </div>

      <div className="my-3">
        <CategoryBadgeGroup
          defaultValue="All"
          onChange={handleCategoryChange}
          items={CATEGORY_ITEMS}
        />
      </div>
    </div>
  );
};

export default Categories;
