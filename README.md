# Cafeteria Menu Advisor — Expert System

**DCIT 313 – Artificial Intelligence | Group Project**

---

## Group Members

| Name | Student ID | Role |
|------|------------|------|
| Amos Fiifi Addo | 22019500 | Project Manager |
| Emmanuel Grant Boamah | 22154941 | Knowledge Engineer |
| Maa Afia Amoako-Antwi | 22049822 | Knowledge Engineer |
| Prince Elikplim Amuzu | 22107096 | Programmer |
| Jeffrey Yaw Eshun | 22124876 | Programmer |
| Michael Obiri Addo | 22182561 | Programmer |
| Barbara Elizabeth Korlekie Sackey | 22012722 | Programmer |

---

## System Purpose

The **Cafeteria Menu Advisor** is a rule-based expert system designed to help students make smarter, healthier meal choices at the cafeteria. Poor dietary decisions are a common challenge among students, and this system addresses that by providing intelligent, personalised meal recommendations based on each student's unique needs and preferences.

The system takes into account a student's dietary category (vegetarian, non-vegetarian, or gym student), nutritional goals, health objectives such as weight loss or weight gain, preferred meal time, and convenience needs. Using this information, it recommends the most suitable meals from a structured knowledge base of 15 carefully selected cafeteria options, and also generates a balanced 7-day weekly meal plan.

All reasoning intelligence lives entirely in **SWI-Prolog**, where knowledge is represented as production rules (IF–THEN Horn clauses) and evaluated through forward chaining. User inputs are asserted as dynamic facts into working memory, rules are fired by priority, and conflicts are resolved systematically before a final recommendation is produced. Python serves only as a thin interface bridge, and a built-in safety guard ensures that dietary restrictions such as preventing vegetarian students from receiving meat-based meals are strictly enforced at all times.