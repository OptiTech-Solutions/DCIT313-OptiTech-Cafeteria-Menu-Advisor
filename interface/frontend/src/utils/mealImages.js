import oatmeal from '../assets/meals/oatmeal.jpg'
import tofuStirFry from '../assets/meals/tofu-stir-fry.jpeg'
import chicken from '../assets/meals/chicken.jpg'
import fish from '../assets/meals/fish.jpg'
import avocadoToast from '../assets/meals/avocado-toast.jpg'
import smoothie from '../assets/meals/smoothie.webp'
import burger from '../assets/meals/burger.jpg'
import salad from '../assets/meals/salad.jpg'
import lentil from '../assets/meals/lentil.jpg'
import beans from '../assets/meals/beans.jpg'
import yogurt from '../assets/meals/yogurt.jpg'
import friedRice from '../assets/meals/fried-rice.jpg'
import fruit from '../assets/meals/fruit.jpg'
import soup from '../assets/meals/soup.jpg'
import quinoa from '../assets/meals/quinoa.jpg'
import mealBowl from '../assets/meal-bowl.svg'
import freshPlate from '../assets/fresh-plate.svg'
import weeklyPlan from '../assets/weekly-plan.svg'

export const MEAL_IMAGE_POOL = [
  lentil,
  chicken,
  tofuStirFry,
  friedRice,
  oatmeal,
  fish,
  beans,
  fruit,
  avocadoToast,
  freshPlate,
  yogurt,
  burger,
  quinoa,
  smoothie,
  salad,
  mealBowl,
  weeklyPlan,
  soup,
]

export const MEAL_IMAGES = {
  m1: lentil,
  m2: chicken,
  m3: tofuStirFry,
  m4: friedRice,
  m5: oatmeal,
  m6: fish,
  m7: beans,
  m8: fruit,
  m9: avocadoToast,
  m10: freshPlate,
  m11: yogurt,
  m12: burger,
  m13: quinoa,
  m14: smoothie,
  m15: salad,
  m16: mealBowl,
  m17: weeklyPlan,
  m18: soup,
}

export const MEAL_NAME_IMAGES = {
  'Lentil Salad with Boiled Eggs and Nuts': lentil,
  'Grilled Chicken with Brown Rice': chicken,
  'Vegetable Stir Fry with Tofu': tofuStirFry,
  'Fried Rice with Chicken': friedRice,
  'Oatmeal with Fruits and Nuts': oatmeal,
  'Baked Fish with Steamed Vegetables': fish,
  'Beans with Plantain': beans,
  'Fruit Salad': fruit,
  'Scrambled Eggs with Avocado Toast': avocadoToast,
  'Turkey Wrap with Vegetables': freshPlate,
  'Greek Yogurt with Granola and Honey': yogurt,
  'Beef Stir Fry with Mixed Vegetables': burger,
  'Chickpea and Quinoa Bowl': quinoa,
  'Protein Smoothie with Banana and Peanut Butter': smoothie,
  'Grilled Tilapia with Salad': salad,
  'Grilled Vegetable Wrap': mealBowl,
  'Herbed Chicken with Quinoa': weeklyPlan,
  'Tomato Basil Soup with Whole Wheat Toast': soup,
}

export function getMealImage(meal) {
  if (!meal) return mealBowl
  return (
    MEAL_IMAGES[meal.id] ||
    MEAL_IMAGES[meal.meal_id] ||
    MEAL_NAME_IMAGES[meal.name] ||
    MEAL_NAME_IMAGES[meal.meal_name] ||
    mealBowl
  )
}

export function getMealImageByName(name) {
  if (!name) return mealBowl
  return MEAL_NAME_IMAGES[name] || mealBowl
}
