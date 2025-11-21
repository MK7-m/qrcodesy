export const CATEGORIES = {
    "rest-1": [
      { id: "whole-chicken", name: "وجبات الفروج الكامل" },
      { id: "broasted", name: "بروستد" },
      { id: "sandwiches", name: "سندويش" },
      { id: "sides", name: "مقبلات & إضافات" },
      { id: "drinks", name: "مشروبات" },
    ],
  
    "rest-2": [
      { id: "grill", name: "مشاوي عالفحم" },
      { id: "kababs", name: "كباب وأوصال" },
      { id: "platters", name: "وجبات وصواني" },
      { id: "salads", name: "سلطات ومقبلات" },
      { id: "drinks", name: "مشروبات" },
    ],
  
    "rest-3": [
      { id: "home-cooking", name: "طبخ بيت" },
      { id: "stuffed", name: "محاشي ويبرق" },
      { id: "rice-meals", name: "أرز ودجاج" },
      { id: "trays", name: "صواني بالفرن" },
      { id: "sides", name: "مقبلات" },
    ],
  
    "rest-4": [
      { id: "shawarma", name: "شاورما" },
      { id: "fried-sandwiches", name: "سندويش مقلي" },
      { id: "burgers", name: "برغر" },
      { id: "meals", name: "وجبات كريسبي" },
      { id: "drinks", name: "مشروبات" },
    ],
  
    "rest-5": [
      { id: "manaqeesh", name: "مناقيش" },
      { id: "lahm-b-ajin", name: "لحمة بعجين" },
      { id: "pizza", name: "بيتزا" },
      { id: "pastries", name: "معجنات متنوعة" },
      { id: "drinks", name: "مشروبات" },
    ],
  
    "rest-6": [
      { id: "sushi-rolls", name: "سوشي رولز" },
      { id: "sashimi", name: "ساشيمي" },
      { id: "tempura", name: "تيمبورا" },
      { id: "fusion", name: "فيوجن" },
      { id: "drinks", name: "مشروبات" },
    ],
  
    "rest-7": [
      { id: "oriental-sweets", name: "حلويات شرقية" },
      { id: "icecream", name: "بوظة عربية" },
      { id: "cakes", name: "كعك ومعجنات" },
      { id: "hot-drinks", name: "مشروبات ساخنة" },
      { id: "cold-drinks", name: "مشروبات باردة" },
    ],
  } as const;
  
  export type CategoryGroup = typeof CATEGORIES;
  export type Category = CategoryGroup[keyof CategoryGroup][number];
  