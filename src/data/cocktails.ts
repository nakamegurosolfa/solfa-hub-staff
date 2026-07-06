export type Cocktail = {
  id: string;
  name: string;
  glass?: string;
  ingredients: string[];
  recipe: string[];
  notes?: string;
};

export const cocktails: Cocktail[] = [
  {
    id: "old-fashioned",
    name: "Old Fashioned",
    glass: "Rocks",
    ingredients: ["60ml Bourbon", "1 sugar cube", "2 dashes Angostura bitters", "Orange peel"],
    recipe: [
      "Muddle sugar cube with bitters in a rocks glass.",
      "Add bourbon and one large ice cube.",
      "Stir gently for 20 seconds.",
      "Express orange peel over the drink and drop in.",
    ],
    notes: "House pour: Buffalo Trace. Use large cube — never crushed ice.",
  },
  {
    id: "negroni",
    name: "Negroni",
    glass: "Rocks",
    ingredients: ["30ml Gin", "30ml Campari", "30ml Sweet Vermouth", "Orange peel"],
    recipe: [
      "Add all ingredients into a mixing glass with ice.",
      "Stir for 20 seconds.",
      "Strain over a large ice cube in a rocks glass.",
      "Garnish with orange peel.",
    ],
    notes: "Batch prep 500ml on Friday if bookings > 40.",
  },
  {
    id: "gin-tonic",
    name: "Gin & Tonic",
    glass: "Highball",
    ingredients: ["45ml Gin", "Tonic water", "Lime wedge"],
    recipe: [
      "Fill highball with fresh ice.",
      "Add gin.",
      "Top with chilled tonic — pour along a bar spoon.",
      "Squeeze lime, drop in.",
    ],
  },
  {
    id: "highball",
    name: "Japanese Highball",
    glass: "Highball",
    ingredients: ["45ml Japanese Whisky", "Chilled soda water", "Lemon peel"],
    recipe: [
      "Pre-chill highball glass.",
      "Fill with hard ice.",
      "Add whisky, stir 3 times.",
      "Top with soda, single gentle stir.",
      "Express lemon peel.",
    ],
    notes: "Never crush the bubbles. Soda must be under 4°C.",
  },
  {
    id: "espresso-martini",
    name: "Espresso Martini",
    glass: "Coupe",
    ingredients: ["40ml Vodka", "20ml Coffee liqueur", "30ml Fresh espresso", "10ml Sugar syrup"],
    recipe: [
      "Pull a fresh single espresso.",
      "Add all ingredients to a shaker with ice.",
      "Hard shake 12 seconds.",
      "Double strain into chilled coupe.",
      "Garnish with 3 coffee beans.",
    ],
  },
  {
    id: "margarita",
    name: "Margarita",
    glass: "Coupe",
    ingredients: ["50ml Tequila Blanco", "20ml Cointreau", "20ml Fresh lime juice", "Salt rim"],
    recipe: [
      "Salt half the rim of a chilled coupe.",
      "Shake all ingredients with ice.",
      "Double strain.",
    ],
  },
];
