# Knowledge Engineering Report
## DCIT 313 — Artificial Intelligence
### Cafeteria Menu Advisor Expert System

---

## 1. Introduction

This report documents the **knowledge acquisition process** used to build the Cafeteria Menu Advisor Expert System. It describes  how domain knowledge was gathered, structured, validated, and encoded into SWI-Prolog as the system's intelligent core.

The system recommends cafeteria meals to university students based on their dietary category, nutritional goals, health objectives, meal type preference, and convenience needs.

---

## 2. Knowledge Acquisition Methodology

### 2.1 Domain Identification

The problem domain is **student nutrition and meal planning** within a university cafeteria setting. The system must act as a dietary advisor, matching students to meals based on personal preferences and health goals.

### 2.2 Sources of Knowledge

The following sources were used to acquire, verify, and structure the domain knowledge:

| # | Source | Type | Knowledge Extracted |
|---|--------|------|---------------------|
| 1 | Claude AI (Anthropic) | AI Consultation | Prolog syntax, production rule structure, Horn clause design, safety guard logic, and forward chaining implementation |
| 2 | ChatGPT (OpenAI) | AI Consultation | Meal nutritional classification, knowledge representation techniques, and expert system design patterns |
| 3 | Fitness and gym nutrition guides | Secondary / Literature | Gym-suitable meal identification and weight gain/loss meal strategies |
| 4 | DCIT 313 course materials (AI & Expert Systems) | Academic | Production rule structure, forward chaining, conflict resolution strategies |

**Sample questions asked to AI models:**
- "How do I write production rules as Prolog Horn clauses?"
- "How does forward chaining work in an expert system?"
- "How do I prevent vegetarians from getting non-veg recommendations in Prolog?"
- "What is the meal/6 predicate structure for a food knowledge base?"
- "How do I use findall/3 to collect all matching recommendations?"
- "How do I structure a weekly meal plan using modular indexing in Prolog?"

### 2.3 Knowledge Elicitation Techniques

- **Observation:** Studied real cafeteria menus to identify 15 representative meals spanning breakfast, lunch, dinner, and snack categories.
- **Literature Review:** Reviewed nutritional guidelines to classify each meal by macronutrient profile and caloric suitability.
- **Informal Interviews:** Gathered student dietary preferences and common health objectives to define the user input categories.
- **Prototyping & Iteration:** Rules were drafted, tested in SWI-Prolog, and refined based on query results.

---


