"""
Convertisseur de planning d'entraînement → JSON Training Planner

Usage :
    python convert_plan.py

Le script génère un fichier semaine-YYYY-MM-DD.json prêt à importer.
"""

import json
from datetime import date

# ─── Configuration ────────────────────────────────────────────────────────────
# Modifie ici la date du lundi de la semaine
MONDAY = date(2026, 5, 25)

# ─── Données du planning ──────────────────────────────────────────────────────
# Format de chaque séance :
# {
#   "jour": 0-6 (0=lundi, 6=dimanche),
#   "title": "Titre affiché",
#   "type": endurance | récupération | piste | côte | trail | renforcement | repos | sortie longue | autre
#   "distanceMinKm": float,
#   "distanceMaxKm": float,
#   "estimatedDuration": "1h30" (optionnel),
#   "surface": route | trail | forêt | piste | chemin | tapis | autre
#   "pace": endurance fondamentale | conversationnelle | tempo | seuil | fractionné | récupération | libre
#   "objective": texte libre,
#   "description": texte libre,
#   "specificInstructions": texte libre (optionnel),
#   "priority": faible | normale | importante,
# }

SESSIONS = [
    {
        "jour": 0,  # Lundi
        "title": "Repos actif + renforcement léger",
        "type": "renforcement",
        "distanceMinKm": 0,
        "distanceMaxKm": 0,
        "estimatedDuration": "35min",
        "surface": "autre",
        "pace": "libre",
        "objective": "réactivation + prévention tibias/mollets",
        "description": "Pas de course. Renforcement 25–35 min.",
        "specificInstructions": (
            "Mollets excentriques, tibialis raises, squats lents, "
            "fentes arrière, gainage, équilibre une jambe, pont fessier."
        ),
        "priority": "normale",
    },
    {
        "jour": 1,  # Mardi
        "title": "Footing facile",
        "type": "endurance",
        "distanceMinKm": 8,
        "distanceMaxKm": 10,
        "estimatedDuration": "1h00",
        "surface": "route",
        "pace": "conversationnelle",
        "objective": "retrouver de la fluidité",
        "description": "Terrain plat ou légèrement souple, sans gros dénivelé. Allure totalement conversationnelle, très facile.",
        "specificInstructions": "Éviter les Hoka Speedgoat 6.",
        "priority": "normale",
    },
    {
        "jour": 2,  # Mercredi
        "title": "Repos ou renforcement haut du corps",
        "type": "récupération",
        "distanceMinKm": 0,
        "distanceMaxKm": 0,
        "estimatedDuration": "40min",
        "surface": "autre",
        "pace": "libre",
        "objective": "récupération",
        "description": "Si fatigue encore présente : repos total. Sinon 30–40 min renforcement haut du corps.",
        "specificInstructions": (
            "Pompes, tirage/tractions, épaules, gainage, lombaires légers. "
            "Pas de grosse charge jambes."
        ),
        "priority": "faible",
    },
    {
        "jour": 3,  # Jeudi
        "title": "Séance qualité légère",
        "type": "piste",
        "distanceMinKm": 10,
        "distanceMaxKm": 12,
        "estimatedDuration": "1h15",
        "surface": "route",
        "pace": "seuil",
        "objective": "retrouver du rythme sans fatigue excessive",
        "description": "6×3 min allure seuil confortable avec récupération 2 min trot. Finir propre, pas détruit.",
        "specificInstructions": (
            "15 min échauffement. 6×3 min allure seuil confortable. "
            "Récupération 2 min trot. 10–15 min retour au calme."
        ),
        "priority": "importante",
    },
    {
        "jour": 4,  # Vendredi
        "title": "Repos",
        "type": "repos",
        "distanceMinKm": 0,
        "distanceMaxKm": 0,
        "surface": "autre",
        "pace": "libre",
        "objective": "récupération",
        "description": "Repos. Mobilité légère possible : chevilles, mollets, hanches.",
        "specificInstructions": "Hydratation + sommeil prioritaires.",
        "priority": "normale",
    },
    {
        "jour": 5,  # Samedi
        "title": "Footing vallonné facile",
        "type": "trail",
        "distanceMinKm": 10,
        "distanceMaxKm": 12,
        "estimatedDuration": "1h20",
        "surface": "trail",
        "pace": "endurance fondamentale",
        "objective": "retrouver le plaisir trail et les appuis",
        "description": "D+ 200 à 350 m. Domaine de la Burthe ou secteur Palmer/Cenon. Pas de montée à bloc.",
        "specificInstructions": "D+ 200–350 m. Pas de montée à bloc.",
        "priority": "normale",
    },
    {
        "jour": 6,  # Dimanche
        "title": "Sortie longue propre",
        "type": "sortie longue",
        "distanceMinKm": 14,
        "distanceMaxKm": 16,
        "estimatedDuration": "1h50",
        "surface": "chemin",
        "pace": "endurance fondamentale",
        "objective": "volume",
        "description": "Mix souple/roulant, éviter terrain trop cassant. Finir frais.",
        "specificInstructions": (
            "Allure endurance fondamentale réelle. "
            "Critère de réussite : tu dois avoir l'impression de pouvoir continuer encore 10 minutes."
        ),
        "priority": "importante",
    },
]

# ─── Génération ───────────────────────────────────────────────────────────────

def generate_json(monday: date, sessions: list) -> list:
    from datetime import timedelta
    result = []
    for i, s in enumerate(sessions):
        session_date = monday + timedelta(days=s["jour"])
        session_id = f"s-{monday.strftime('%Y%m%d')}-{i+1:02d}"

        entry = {
            "id": session_id,
            "date": session_date.strftime("%Y-%m-%d"),
            "title": s["title"],
            "type": s["type"],
            "distanceMinKm": s["distanceMinKm"],
            "distanceMaxKm": s["distanceMaxKm"],
            "surface": s["surface"],
            "pace": s["pace"],
            "objective": s["objective"],
            "priority": s["priority"],
            "status": "prévu",
        }

        # Champs optionnels
        if s.get("estimatedDuration"):
            entry["estimatedDuration"] = s["estimatedDuration"]
        if s.get("description"):
            entry["description"] = s["description"]
        if s.get("specificInstructions"):
            entry["specificInstructions"] = s["specificInstructions"]

        result.append(entry)
    return result


if __name__ == "__main__":
    data = generate_json(MONDAY, SESSIONS)
    filename = f"semaine-{MONDAY.strftime('%Y-%m-%d')}.json"

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ Fichier généré : {filename}")
    print(f"   {len(data)} séances du {data[0]['date']} au {data[-1]['date']}")
    print()
    for s in data:
        km = f"{s['distanceMinKm']}–{s['distanceMaxKm']} km" if s['distanceMaxKm'] > 0 else "—"
        print(f"   {s['date']}  {s['title']:<40} {km}")
