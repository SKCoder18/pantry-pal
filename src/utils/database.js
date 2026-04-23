const getImage = (category) => {
    const urls = {
        grains: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&w=400&q=80",
        pulses: "https://images.unsplash.com/photo-1537284693309-8874136952d7?auto=format&w=400&q=80",
        spices: "https://images.unsplash.com/photo-1599905961996-ba647161b9fc?auto=format&w=400&q=80",
        oils: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&w=400&q=80",
        dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&w=400&q=80",
        produce: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&w=400&q=80",
        meat: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&w=400&q=80",
        bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&w=400&q=80",
        pantry: "https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?auto=format&w=400&q=80",
    };
    return urls[category] || urls.pantry;
};

export const INGREDIENTS_DB = [
  // 🌾 Grains & Cereals -> Pantry
  { name: "Rice (Basmati, Sona Masoori)", image: getImage('grains'), category: 'Pantry' },
  { name: "Wheat flour (Atta)", image: getImage('grains'), category: 'Pantry' },
  { name: "Rava (Sooji)", image: getImage('grains'), category: 'Pantry' },
  { name: "Poha (Flattened rice)", image: getImage('grains'), category: 'Pantry' },
  { name: "Vermicelli (Seviyan)", image: getImage('grains'), category: 'Pantry' },
  { name: "Oats", image: getImage('grains'), category: 'Pantry' },
  { name: "Cornflakes", image: getImage('grains'), category: 'Pantry' },

  // 🫘 Pulses & Lentils -> Pantry
  { name: "Toor dal (Arhar)", image: getImage('pulses'), category: 'Pantry' },
  { name: "Moong dal (Yellow/Green)", image: getImage('pulses'), category: 'Pantry' },
  { name: "Urad dal", image: getImage('pulses'), category: 'Pantry' },
  { name: "Chana dal", image: getImage('pulses'), category: 'Pantry' },
  { name: "Rajma (Kidney beans)", image: getImage('pulses'), category: 'Pantry' },
  { name: "Kabuli chana (Chickpeas)", image: getImage('pulses'), category: 'Pantry' },
  { name: "Black chana", image: getImage('pulses'), category: 'Pantry' },

  // 🧂 Spices & Masalas -> Pantry
  { name: "Turmeric powder (Haldi)", image: getImage('spices'), category: 'Pantry' },
  { name: "Red chilli powder", image: getImage('spices'), category: 'Pantry' },
  { name: "Coriander powder", image: getImage('spices'), category: 'Pantry' },
  { name: "Cumin seeds (Jeera)", image: getImage('spices'), category: 'Pantry' },
  { name: "Mustard seeds (Rai)", image: getImage('spices'), category: 'Pantry' },
  { name: "Garam masala", image: getImage('spices'), category: 'Pantry' },
  { name: "Sambar powder", image: getImage('spices'), category: 'Pantry' },
  { name: "Hing (Asafoetida)", image: getImage('spices'), category: 'Pantry' },

  // 🛢️ Oils & Condiments -> Pantry
  { name: "Cooking oil (Sunflower/Mustard)", image: getImage('oils'), category: 'Pantry' },
  { name: "Vinegar", image: getImage('oils'), category: 'Pantry' },
  { name: "Soy sauce", image: getImage('oils'), category: 'Pantry' },
  { name: "Tomato ketchup", image: getImage('pantry'), category: 'Pantry' },
  { name: "Green chutney / Pickles (Achar)", image: getImage('pantry'), category: 'Pantry' },
  { name: "Sugar", image: getImage('pantry'), category: 'Pantry' },
  { name: "Jaggery (Gur)", image: getImage('pantry'), category: 'Pantry' },
  { name: "Salt", image: "https://images.unsplash.com/photo-1621245052955-44cbaf1a5924?auto=format&w=400&q=80", category: 'Pantry' },
  { name: "Tea powder / Coffee", image: getImage('pantry'), category: 'Pantry' },
  { name: "Dry fruits (Almonds, Cashews)", image: getImage('pantry'), category: 'Pantry' },

  // 🥛 2. Dairy Items -> Dairy
  { name: "Milk", image: getImage('dairy'), category: 'Dairy' },
  { name: "Curd (Dahi)", image: getImage('dairy'), category: 'Dairy' },
  { name: "Paneer", image: getImage('dairy'), category: 'Dairy' },
  { name: "Butter", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&w=400&q=80", category: 'Dairy' },
  { name: "Cheese (Mozzarella)", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&w=400&q=80", category: 'Dairy' },
  { name: "Cream (Malai)", image: getImage('dairy'), category: 'Dairy' },
  { name: "Buttermilk (Chaas)", image: getImage('dairy'), category: 'Dairy' },
  { name: "Lassi (Sweet/Salted)", image: getImage('dairy'), category: 'Dairy' },
  { name: "Condensed milk", image: getImage('dairy'), category: 'Dairy' },
  { name: "Ghee", image: getImage('dairy'), category: 'Dairy' },

  // 🥦 3. Produce (Vegetables) -> Produce
  { name: "Onion", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&w=400&q=80", category: 'Produce' },
  { name: "Potato", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&w=400&q=80", category: 'Produce' },
  { name: "Tomato", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&w=400&q=80", category: 'Produce' },
  { name: "Green chilli", image: getImage('produce'), category: 'Produce' },
  { name: "Ginger", image: getImage('produce'), category: 'Produce' },
  { name: "Garlic", image: "https://images.unsplash.com/photo-1540148426945-36d19e51c89f?auto=format&w=400&q=80", category: 'Produce' },
  { name: "Carrot", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&w=400&q=80", category: 'Produce' },
  { name: "Beans", image: getImage('produce'), category: 'Produce' },
  { name: "Brinjal (Eggplant)", image: getImage('produce'), category: 'Produce' },
  { name: "Capsicum", image: getImage('produce'), category: 'Produce' },
  { name: "Cauliflower", image: getImage('produce'), category: 'Produce' },
  { name: "Cabbage", image: getImage('produce'), category: 'Produce' },
  { name: "Spinach (Palak)", image: getImage('produce'), category: 'Produce' },
  { name: "Coriander (Dhaniya)", image: getImage('produce'), category: 'Produce' },
  { name: "Mint (Pudina)", image: getImage('produce'), category: 'Produce' },
  { name: "Fenugreek leaves (Methi)", image: getImage('produce'), category: 'Produce' },
  { name: "Banana", image: getImage('produce'), category: 'Produce' },
  { name: "Apple", image: getImage('produce'), category: 'Produce' },
  { name: "Mango", image: getImage('produce'), category: 'Produce' },
  { name: "Orange", image: getImage('produce'), category: 'Produce' },
  { name: "Papaya", image: getImage('produce'), category: 'Produce' },
  { name: "Guava", image: getImage('produce'), category: 'Produce' },
  { name: "Pomegranate", image: getImage('produce'), category: 'Produce' },

  // 🍗 4. Meat & Protein Items -> Meat
  { name: "Chicken", image: getImage('meat'), category: 'Meat' },
  { name: "Mutton (Goat meat)", image: getImage('meat'), category: 'Meat' },
  { name: "Fish (Rohu, Katla)", image: getImage('meat'), category: 'Meat' },
  { name: "Prawns", image: getImage('meat'), category: 'Meat' },
  { name: "Eggs", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad02?auto=format&w=400&q=80", category: 'Meat' },

  // 🌱 Vegetarian Protein -> Produce
  { name: "Tofu", image: getImage('dairy'), category: 'Produce' },
  { name: "Soya chunks (Nutrela)", image: getImage('grains'), category: 'Pantry' },

  // 🥖 5. Bakery Items -> Bakery
  { name: "Bread (White/Brown)", image: getImage('bakery'), category: 'Bakery' },
  { name: "Pav (for pav bhaji)", image: getImage('bakery'), category: 'Bakery' },
  { name: "Buns", image: getImage('bakery'), category: 'Bakery' },
  { name: "Rusk (Toast biscuits)", image: getImage('bakery'), category: 'Bakery' },
  { name: "Biscuits (Parle-G, Marie)", image: getImage('bakery'), category: 'Bakery' },
  { name: "Cookies", image: getImage('bakery'), category: 'Bakery' },
  { name: "Cakes", image: getImage('bakery'), category: 'Bakery' },
  { name: "Muffins", image: getImage('bakery'), category: 'Bakery' }
];
