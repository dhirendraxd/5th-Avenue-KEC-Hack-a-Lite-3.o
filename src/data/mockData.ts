export interface POI {
  id: string;
  name: string;
  type: "mountain" | "temple" | "lake" | "trek" | "homestay" | "restaurant";
  lat: number;
  lng: number;
  budget: "low" | "medium" | "high";
  crowd: "low" | "medium" | "high";
  description: string;
  elevation?: string;
  rating: number;
}

export const pois: POI[] = [
  { id: "1", name: "Mount Everest Base Camp", type: "mountain", lat: 28.0025, lng: 86.8528, budget: "high", crowd: "high", description: "The world's highest peak base camp trek.", elevation: "5,364m", rating: 4.9 },
  { id: "2", name: "Pashupatinath Temple", type: "temple", lat: 27.7104, lng: 85.3487, budget: "low", crowd: "high", description: "Sacred Hindu temple on the banks of Bagmati River.", rating: 4.8 },
  { id: "3", name: "Phewa Lake", type: "lake", lat: 28.2096, lng: 83.9567, budget: "low", crowd: "medium", description: "Beautiful freshwater lake in Pokhara with Annapurna views.", rating: 4.7 },
  { id: "4", name: "Annapurna Circuit", type: "trek", lat: 28.5965, lng: 83.8203, budget: "medium", crowd: "medium", description: "Classic 160-230km trek through diverse landscapes.", elevation: "5,416m max", rating: 4.9 },
  { id: "5", name: "Boudhanath Stupa", type: "temple", lat: 27.7215, lng: 85.3620, budget: "low", crowd: "medium", description: "One of the largest spherical stupas in Nepal.", rating: 4.6 },
  { id: "6", name: "Chitwan Homestay", type: "homestay", lat: 27.5291, lng: 84.3542, budget: "low", crowd: "low", description: "Traditional Tharu community homestay near Chitwan National Park.", rating: 4.5 },
  { id: "7", name: "Thamel Momo House", type: "restaurant", lat: 27.7152, lng: 85.3123, budget: "low", crowd: "high", description: "Famous for authentic Nepali momos and thukpa.", rating: 4.4 },
  { id: "8", name: "Langtang Valley Trek", type: "trek", lat: 28.2139, lng: 85.5238, budget: "medium", crowd: "low", description: "Beautiful valley trek north of Kathmandu.", elevation: "3,800m", rating: 4.7 },
  { id: "9", name: "Lumbini", type: "temple", lat: 27.4833, lng: 83.2767, budget: "low", crowd: "medium", description: "Birthplace of Lord Buddha, UNESCO World Heritage Site.", rating: 4.6 },
  { id: "10", name: "Nagarkot Sunrise", type: "mountain", lat: 27.7172, lng: 85.5200, budget: "medium", crowd: "medium", description: "Best sunrise viewpoint near Kathmandu with Himalayan panorama.", elevation: "2,195m", rating: 4.5 },
];

export const touristFlowData = [
  { month: "Jan", kathmandu: 45000, pokhara: 28000, everest: 8000, chitwan: 12000 },
  { month: "Feb", kathmandu: 52000, pokhara: 32000, everest: 12000, chitwan: 15000 },
  { month: "Mar", kathmandu: 68000, pokhara: 45000, everest: 22000, chitwan: 20000 },
  { month: "Apr", kathmandu: 75000, pokhara: 52000, everest: 35000, chitwan: 18000 },
  { month: "May", kathmandu: 60000, pokhara: 40000, everest: 28000, chitwan: 14000 },
  { month: "Jun", kathmandu: 35000, pokhara: 22000, everest: 5000, chitwan: 8000 },
  { month: "Jul", kathmandu: 28000, pokhara: 18000, everest: 3000, chitwan: 6000 },
  { month: "Aug", kathmandu: 30000, pokhara: 20000, everest: 4000, chitwan: 7000 },
  { month: "Sep", kathmandu: 55000, pokhara: 35000, everest: 18000, chitwan: 16000 },
  { month: "Oct", kathmandu: 85000, pokhara: 60000, everest: 40000, chitwan: 25000 },
  { month: "Nov", kathmandu: 78000, pokhara: 55000, everest: 32000, chitwan: 22000 },
  { month: "Dec", kathmandu: 50000, pokhara: 30000, everest: 10000, chitwan: 13000 },
];

export const badges = [
  { id: "everest", name: "Everest Dreamer", icon: "🏔️", description: "Visited Everest Base Camp region", unlocked: false },
  { id: "temple", name: "Temple Explorer", icon: "🛕", description: "Visited 3 sacred temples", unlocked: true },
  { id: "foodie", name: "Momo Master", icon: "🥟", description: "Tried momos at 5 different spots", unlocked: true },
  { id: "trek", name: "Trail Blazer", icon: "🥾", description: "Completed a multi-day trek", unlocked: false },
  { id: "culture", name: "Cultural Guardian", icon: "🎭", description: "Completed 3 cultural quizzes", unlocked: true },
  { id: "sunrise", name: "Sunrise Seeker", icon: "🌅", description: "Watched sunrise from Nagarkot", unlocked: false },
];

export const budgetOptions = {
  low: { daily: 2000, label: "Budget", stays: "Hostels & Homestays", food: "Local eateries & street food", transport: "Local buses & shared jeeps" },
  medium: { daily: 6000, label: "Mid-Range", stays: "3-star hotels & lodges", food: "Restaurants & cafes", transport: "Tourist buses & taxis" },
  high: { daily: 15000, label: "Premium", stays: "5-star resorts & luxury lodges", food: "Fine dining", transport: "Private vehicles & domestic flights" },
};

export const guides = [
  { id: "1", name: "Ram Bahadur Gurung", rating: 4.9, speciality: "Annapurna Region", languages: ["Nepali", "English", "Hindi"], verified: true },
  { id: "2", name: "Lakpa Sherpa", rating: 4.8, speciality: "Everest Region", languages: ["Nepali", "English", "Tibetan"], verified: true },
  { id: "3", name: "Sita Thapa", rating: 4.7, speciality: "Cultural Tours", languages: ["Nepali", "English", "Japanese"], verified: true },
  { id: "4", name: "Dorje Tamang", rating: 4.6, speciality: "Langtang Valley", languages: ["Nepali", "English"], verified: true },
];
