export type DemoItem = {
  name: string;
  children?: string[];
};

export const createDemoData = () => {
  const data: Record<string, DemoItem> = {
    root: { name: "Root", children: ["lunch", "dessert"] },
    lunch: { name: "Lunch", children: ["sandwich", "salad", "soup"] },
    sandwich: { name: "Sandwich" },
    salad: { name: "Salad" },
    soup: { name: "Soup", children: ["tomato", "chicken"] },
    tomato: { name: "Tomato" },
    chicken: { name: "Chicken" },
    dessert: { name: "Dessert", children: ["icecream", "cake"] },
    icecream: { name: "Icecream" },
    cake: { name: "Cake" },
  };

  const dataLoader = {
    getItem: (id) => data[id],
    getChildren: (id) => data[id]?.children ?? [],
  };

  return [dataLoader, data] as const;
};
