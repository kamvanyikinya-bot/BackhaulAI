import json
import random
from datetime import datetime

names = [
    "Johan", "Pieter", "Sibusiso", "Thabo", "Lindiwe", "Nomvula", "Andries", "Gert", "Barend", "Marius",
    "Lerato", "Kagiso", "Dumi", "Bongani", "Zanele", "Palesa", "Willem", "Fanie", "Koos", "Hendrik",
    "Mandla", "Sipho", "Themba", "Jabulani", "Nkosazana", "Gugu", "Zuki", "Ayanda", "Lubabalo", "Xolani"
]

surnames = [
    "Botha", "Van der Merwe", "Dlamini", "Mokoena", "Khumalo", "Naidoo", "Pillay", "Ackerman", "Smith", "Erasmus",
    "Zuma", "Mbeki", "Ramaphosa", "Sisulu", "Tambo", "Modise", "Lekota", "Buthelezi", "De Klerk", "Malan",
    "Smit", "Meyer", "Pretorius", "Du Plessis", "Joubert", "Steyn", "Coetzee", "Ndlovu", "Sibanda", "Maphosa"
]

cities = [
    ("Johannesburg", "Gauteng"),
    ("Pretoria", "Gauteng"),
    ("Cape Town", "Western Cape"),
    ("Durban", "KwaZulu-Natal"),
    ("Port Elizabeth", "Eastern Cape"),
    ("Bloemfontein", "Free State"),
    ("East London", "Eastern Cape"),
    ("Polokwane", "Limpopo"),
    ("Mbombela", "Mpumalanga"),
    ("Kimberley", "Northern Cape"),
    ("George", "Western Cape"),
    ("Pietermaritzburg", "KwaZulu-Natal"),
    ("Rustenburg", "North West"),
    ("Vereeniging", "Gauteng"),
    ("Newcastle", "KwaZulu-Natal")
]

truck_types = ["flatbed", "refrigerated", "tautliner", "curtainside", "container", "skeletal"]

corridors = [
    ("JHB-DBN", 570),
    ("JHB-CPT", 1400),
    ("DBN-CPT", 1600),
    ("JHB-PE", 1000),
    ("JHB-EL", 950),
    ("CPT-PE", 750),
    ("JHB-BLOEM", 400),
    ("DBN-PE", 900)
]

def generate_leads(count=150):
    leads = []
    for i in range(1, count + 1):
        name = f"{random.choice(names)} {random.choice(surnames)}"
        city, region = random.choice(cities)
        truck_type = random.choice(truck_types)
        corridor_name, distance = random.choice(corridors)
        
        empty_return = random.choice([True, True, True, False]) # 75% have the problem
        empty_km = random.randint(300, 1500) if empty_return else 0
        waste_zar_km = 51.60 # Estimated cost per empty km
        monthly_waste = empty_km * waste_zar_km
        annual_waste = monthly_waste * 12
        
        lead = {
            "id": 100 + i,
            "name": name,
            "city": city,
            "region": region,
            "truck_type": truck_type,
            "typical_routes": [corridor_name],
            "primary_corridor": corridor_name,
            "has_empty_return_problem": empty_return,
            "estimated_weekly_empty_km": empty_km // 4,
            "estimated_monthly_waste_zar": int(monthly_waste),
            "estimated_annual_waste_zar": int(annual_waste),
            "onboarding_message": f"Hi {name}, stop driving empty on the {corridor_name} corridor. You're losing about R{int(annual_waste):,}/year in empty return trips. BackhaulAI finds you guaranteed return loads the moment you deliver. Sign up in 2 minutes — get your first return load matched automatically.",
            "acquisition_priority": "high" if annual_waste > 400000 else "medium"
        }
        leads.append(lead)
    return leads

if __name__ == "__main__":
    new_leads = generate_leads(160)
    output = {
        "generated_at": datetime.now().isoformat(),
        "total_leads": len(new_leads),
        "leads": new_leads
    }
    with open("/home/team/shared/leads/b2c-leads-expanded.json", "w") as f:
        json.dump(output, f, indent=2)
    print(f"Generated {len(new_leads)} leads.")
