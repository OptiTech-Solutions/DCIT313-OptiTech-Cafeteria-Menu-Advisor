%%  cafeteria_kb.pl  —  Master Entry Point
%%  ──────────────────────────────────────────
%%  Python consults ONLY this file.
%%  It loads every knowledge base module in the correct order.

:- consult('meals.pl').
:- consult('production_rules.pl').
:- consult('weekly_plan_rules.pl').
:- consult('explanation.pl').
