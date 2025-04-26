export type DemoItem = {
  name: string;
  children?: string[];
};

export const data: Record<string, DemoItem> = {
  root: {
    name: "Root",
    children: ["fruit", "vegetables", "meals", "dessert", "drinks"],
  },
  fruit: {
    name: "Fruit",
    children: ["apple", "banana", "orange", "berries", "lemon"],
  },
  apple: { name: "Apple" },
  banana: { name: "Banana" },
  orange: { name: "Orange" },
  lemon: { name: "Lemon" },
  berries: { name: "Berries", children: ["red", "blue", "black"] },
  red: { name: "Red", children: ["strawberry", "raspberry"] },
  strawberry: { name: "Strawberry" },
  raspberry: { name: "Raspberry" },
  blue: { name: "Blue", children: ["blueberry"] },
  blueberry: { name: "Blueberry" },
  black: { name: "Black", children: ["blackberry"] },
  blackberry: { name: "Blackberry" },
  vegetables: {
    name: "Vegetables",
    children: ["tomato", "carrot", "cucumber", "potato"],
  },
  tomato: { name: "Tomato" },
  carrot: { name: "Carrot" },
  cucumber: { name: "Cucumber" },
  potato: { name: "Potato" },
  meals: {
    name: "Meals",
    children: ["america", "europe", "asia", "australia"],
  },
  america: { name: "America", children: ["burger", "hotdog", "pizza"] },
  burger: { name: "Burger" },
  hotdog: { name: "Hotdog" },
  pizza: { name: "Pizza" },
  europe: {
    name: "Europe",
    children: ["pasta", "paella", "schnitzel", "risotto", "weisswurst"],
  },
  pasta: { name: "Pasta" },
  paella: { name: "Paella" },
  schnitzel: { name: "Schnitzel" },
  risotto: { name: "Risotto" },
  weisswurst: { name: "Weisswurst" },
  asia: { name: "Asia", children: ["sushi", "ramen", "curry", "noodles"] },
  sushi: { name: "Sushi" },
  ramen: { name: "Ramen" },
  curry: { name: "Curry" },
  noodles: { name: "Noodles" },
  australia: {
    name: "Australia",
    children: ["potatowedges", "pokebowl", "lemoncurd", "kumarafries"],
  },
  potatowedges: { name: "Potato Wedges" },
  pokebowl: { name: "Poke Bowl" },
  lemoncurd: { name: "Lemon Curd" },
  kumarafries: { name: "Kumara Fries" },
  dessert: {
    name: "Dessert",
    children: ["icecream", "cake", "pudding", "cookies"],
  },
  icecream: { name: "Icecream" },
  cake: { name: "Cake" },
  pudding: { name: "Pudding" },
  cookies: { name: "Cookies" },
  drinks: { name: "Drinks", children: ["water", "juice", "beer", "wine"] },
  water: { name: "Water" },
  juice: { name: "Juice" },
  beer: { name: "Beer" },
  wine: { name: "Wine" },
};

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const syncDataLoader = {
  getItem: (id: string) => data[id],
  getChildren: (id: string) => data[id]?.children ?? [],
};

export const asyncDataLoader = {
  getItem: (itemId: string) => wait(500).then(() => data[itemId]),
  getChildren: (itemId: string) =>
    wait(800).then(() => data[itemId]?.children ?? []),
};
