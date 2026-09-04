export const farmer = {
  name: "Ramesh",
  location: "Perumbavoor, Kerala",
};

export const crops = [
  {
    id: 1,
    name: "Onion",
    quantity: "1000 kg",
    offers: 5,
  },
  {
    id: 2,
    name: "Tomato",
    quantity: "500 kg",
    offers: 3,
  },
];

export const buyers = [
  {
    id: 1,
    name: "ABC Traders",
    location: "Perumbavoor",
    distance: "2 km",
    price: "₹32/kg",
    type: "Permaboor Market",
  },
  {
    id: 2,
    name: "XYZ Market",
    location: "Aluva",
    distance: "5 km",
    price: "₹31/kg",
    type: "Wholesale Market",
  },
  {
    id: 3,
    name: "FreshMart",
    location: "Kochi",
    distance: "12 km",
    price: "₹30/kg",
    type: "Retail Chain",
  },
];

export const marketPrices = [
  {
    crop: "Onion",
    min: "₹20/kg",
    max: "₹40/kg",
    modal: "₹30/kg",
  },
  {
    crop: "Tomato",
    min: "₹15/kg",
    max: "₹30/kg",
    modal: "₹25/kg",
  },
  {
    crop: "Potato",
    min: "₹18/kg",
    max: "₹28/kg",
    modal: "₹22/kg",
  },
  {
    crop: "Chilli",
    min: "₹80/kg",
    max: "₹150/kg",
    modal: "₹120/kg",
  },
];

export const demandCrops = [
  {
    rank: 1,
    name: "Onion",
    demand: "High Demand",
  },
  {
    rank: 2,
    name: "Tomato",
    demand: "High Demand",
  },
  {
    rank: 3,
    name: "Chilli",
    demand: "Medium Demand",
  },
];

export const buyerDemands = [
  {
    crop: "Onion",
    quantity: "1000 kg",
    price: "₹32/kg",
    location: "Perumbavoor",
    offers: 5,
  },
  {
    crop: "Tomato",
    quantity: "500 kg",
    price: "₹25/kg",
    location: "Perumbavoor",
    offers: 3,
  },
];