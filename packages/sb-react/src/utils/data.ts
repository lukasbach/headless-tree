export type DemoItem = {
  name: string;
  children?: string[];
};

const sampleTree: Record<string, DemoItem> = {
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

export const unitTestTree: Record<string, DemoItem> = {
  x: {
    name: "X",
    children: ["x1", "x2", "x3", "x4"],
  },
  x1: {
    name: "X1",
    children: ["x11", "x12", "x13", "x14"],
  },
  x11: {
    name: "X11",
    children: ["x111", "x112", "x113", "x114"],
  },
  x111: { name: "X111" },
  x112: { name: "X112" },
  x113: { name: "X113" },
  x114: { name: "X114" },
  x12: {
    name: "X12",
    children: ["x121", "x122", "x123", "x124"],
  },
  x121: { name: "X121" },
  x122: { name: "X122" },
  x123: { name: "X123" },
  x124: { name: "X124" },
  x13: {
    name: "X13",
    children: ["x131", "x132", "x133", "x134"],
  },
  x131: { name: "X131" },
  x132: { name: "X132" },
  x133: { name: "X133" },
  x134: { name: "X134" },
  x14: {
    name: "X14",
    children: ["x141", "x142", "x143", "x144"],
  },
  x141: { name: "X141" },
  x142: { name: "X142" },
  x143: { name: "X143" },
  x144: { name: "X144" },
  x2: {
    name: "X2",
    children: ["x21", "x22", "x23", "x24"],
  },
  x21: {
    name: "X21",
    children: ["x211", "x212", "x213", "x214"],
  },
  x211: { name: "X211" },
  x212: { name: "X212" },
  x213: { name: "X213" },
  x214: { name: "X214" },
  x22: {
    name: "X22",
    children: ["x221", "x222", "x223", "x224"],
  },
  x221: { name: "X221" },
  x222: { name: "X222" },
  x223: { name: "X223" },
  x224: { name: "X224" },
  x23: {
    name: "X23",
    children: ["x231", "x232", "x233", "x234"],
  },
  x231: { name: "X231" },
  x232: { name: "X232" },
  x233: { name: "X233" },
  x234: { name: "X234" },
  x24: {
    name: "X24",
    children: ["x241", "x242", "x243", "x244"],
  },
  x241: { name: "X241" },
  x242: { name: "X242" },
  x243: { name: "X243" },
  x244: { name: "X244" },
  x3: {
    name: "X3",
    children: ["x31", "x32", "x33", "x34"],
  },
  x31: {
    name: "X31",
    children: ["x311", "x312", "x313", "x314"],
  },
  x311: { name: "X311" },
  x312: { name: "X312" },
  x313: { name: "X313" },
  x314: { name: "X314" },
  x32: {
    name: "X32",
    children: ["x321", "x322", "x323", "x324"],
  },
  x321: { name: "X321" },
  x322: { name: "X322" },
  x323: { name: "X323" },
  x324: { name: "X324" },
  x33: {
    name: "X33",
    children: ["x331", "x332", "x333", "x334"],
  },
  x331: { name: "X331" },
  x332: { name: "X332" },
  x333: { name: "X333" },
  x334: { name: "X334" },
  x34: {
    name: "X34",
    children: ["x341", "x342", "x343", "x344"],
  },
  x341: { name: "X341" },
  x342: { name: "X342" },
  x343: { name: "X343" },
  x344: { name: "X344" },
  x4: {
    name: "X4",
    children: ["x41", "x42", "x43", "x44"],
  },
  x41: {
    name: "X41",
    children: ["x411", "x412", "x413", "x414"],
  },
  x411: { name: "X411" },
  x412: { name: "X412" },
  x413: { name: "X413" },
  x414: { name: "X414" },
  x42: {
    name: "X42",
    children: ["x421", "x422", "x423", "x424"],
  },
  x421: { name: "X421" },
  x422: { name: "X422" },
  x423: { name: "X423" },
  x424: { name: "X424" },
  x43: {
    name: "X43",
    children: ["x431", "x432", "x433", "x434"],
  },
  x431: { name: "X431" },
  x432: { name: "X432" },
  x433: { name: "X433" },
  x434: { name: "X434" },
  x44: {
    name: "X44",
    children: ["x441", "x442", "x443", "x444"],
  },
  x441: { name: "X441" },
  x442: { name: "X442" },
  x443: { name: "X443" },
  x444: { name: "X444" },
};

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const createDemoData = (data = sampleTree) => {
  const syncDataLoader = {
    getItem: (id: string) => data[id],
    getChildren: (id: string) => data[id]?.children ?? [],
  };

  const asyncDataLoader = {
    getItem: (itemId: string) => wait(500).then(() => data[itemId]),
    getChildren: (itemId: string) =>
      wait(800).then(() => data[itemId]?.children ?? []),
  };

  return { data, syncDataLoader, asyncDataLoader };
};
